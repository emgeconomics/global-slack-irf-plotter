#!/usr/bin/env Rscript

# Build the six-observable quarterly SMM panel from the official DGEI
# U.S.-trade-weight workbooks. The script requires readxl and uses only base R
# for transformations and merging.

options(stringsAsFactors = FALSE, warn = 1)

parse_args <- function(args) {
  out <- list(repo_root = NULL)
  for (arg in args) {
    if (startsWith(arg, "--repo-root=")) {
      out$repo_root <- sub("^--repo-root=", "", arg)
    } else {
      stop(sprintf("Unknown argument: %s", arg), call. = FALSE)
    }
  }
  out
}

find_repo_root <- function(explicit = NULL) {
  if (!is.null(explicit)) {
    root <- normalizePath(explicit, winslash = "/", mustWork = TRUE)
  } else {
    script_args <- commandArgs(trailingOnly = FALSE)
    file_arg <- grep("^--file=", script_args, value = TRUE)
    if (length(file_arg) == 1L) {
      script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/", mustWork = TRUE)
      root <- normalizePath(file.path(dirname(script_path), "..", ".."), winslash = "/", mustWork = TRUE)
    } else {
      root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
    }
  }
  if (!file.exists(file.path(root, "AGENTS.md"))) {
    stop(sprintf("Could not confirm repository root: %s", root), call. = FALSE)
  }
  root
}

require_package <- function(name) {
  if (!requireNamespace(name, quietly = TRUE)) {
    stop(
      sprintf("Package '%s' is required. Install it or restore the project environment.", name),
      call. = FALSE
    )
  }
}

as_date_safe <- function(x) {
  if (inherits(x, "Date")) return(x)
  if (inherits(x, c("POSIXct", "POSIXt"))) return(as.Date(x))
  if (is.numeric(x)) return(as.Date(x, origin = "1899-12-30"))
  parsed <- as.Date(as.character(x))
  if (anyNA(parsed) && any(!is.na(x))) {
    stop("At least one DGEI date could not be parsed.", call. = FALSE)
  }
  parsed
}

quarter_start <- function(dates) {
  years <- as.integer(format(dates, "%Y"))
  months <- as.integer(format(dates, "%m"))
  qmonths <- 3L * ((months - 1L) %/% 3L) + 1L
  as.Date(sprintf("%04d-%02d-01", years, qmonths))
}

previous_quarter <- function(dates) {
  years <- as.integer(format(dates, "%Y"))
  months <- as.integer(format(dates, "%m"))
  previous_months <- months - 3L
  rollover <- previous_months < 1L
  previous_months[rollover] <- previous_months[rollover] + 12L
  years[rollover] <- years[rollover] - 1L
  as.Date(sprintf("%04d-%02d-01", years, previous_months))
}

quarter_label <- function(dates) {
  quarters <- ((as.integer(format(dates, "%m")) - 1L) %/% 3L) + 1L
  sprintf("%sQ%d", format(dates, "%Y"), quarters)
}

read_block <- function(path, range) {
  if (!file.exists(path)) stop(sprintf("Missing raw workbook: %s", path), call. = FALSE)
  data <- readxl::read_excel(
    path,
    sheet = "US Trade Weights",
    range = range,
    na = c("#N/A", "NA", "N/A", "")
  )
  expected <- c("Date", "World (ex. U.S.)", "Advanced (ex. U.S.)", "Emerging", "US")
  if (!identical(names(data), expected)) {
    stop(
      sprintf(
        "Unexpected schema in %s (%s). Found: %s",
        basename(path), range, paste(names(data), collapse = " | ")
      ),
      call. = FALSE
    )
  }
  data$Date <- as_date_safe(data$Date)
  for (name in expected[-1L]) data[[name]] <- suppressWarnings(as.numeric(data[[name]]))
  data
}

quarterly_mean_complete <- function(dates, values) {
  keep <- !is.na(dates) & is.finite(values)
  dates <- dates[keep]
  values <- values[keep]
  qdates <- quarter_start(dates)
  groups <- split(seq_along(dates), as.character(qdates))
  rows <- lapply(groups, function(index) {
    q <- qdates[index[1L]]
    q_month <- as.integer(format(q, "%m"))
    expected_months <- q_month + 0:2
    observed_months <- as.integer(format(dates[index], "%m"))
    unique_by_month <- !duplicated(observed_months)
    index <- index[unique_by_month]
    observed_months <- observed_months[unique_by_month]
    if (!all(expected_months %in% observed_months)) return(NULL)
    selected <- match(expected_months, observed_months)
    data.frame(Date = q, Value = mean(values[index[selected]]), stringsAsFactors = FALSE)
  })
  rows <- rows[!vapply(rows, is.null, logical(1))]
  if (length(rows) == 0L) return(data.frame(Date = as.Date(character()), Value = numeric()))
  result <- do.call(rbind, rows)
  result[order(result$Date), , drop = FALSE]
}

quarterly_level <- function(dates, values) {
  keep <- !is.na(dates) & is.finite(values)
  data.frame(Date = quarter_start(dates[keep]), Value = values[keep], stringsAsFactors = FALSE)
}

rename_value <- function(data, name) {
  names(data)[names(data) == "Value"] <- name
  data
}

merge_all <- function(frames) {
  Reduce(function(x, y) merge(x, y, by = "Date", all = FALSE, sort = TRUE), frames)
}

log_change <- function(level, lagged) {
  ifelse(level > 0 & lagged > 0, 100 * log(level / lagged), NA_real_)
}

args <- parse_args(commandArgs(trailingOnly = TRUE))
root <- find_repo_root(args$repo_root)
require_package("readxl")

raw_dir <- file.path(root, "smm", "data", "raw")
processed_dir <- file.path(root, "smm", "data", "processed")
manifest_dir <- file.path(root, "smm", "data", "manifests")
dir.create(processed_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(manifest_dir, recursive = TRUE, showWarnings = FALSE)

paths <- list(
  gdp = file.path(raw_dir, "dgei_gdp.xlsx"),
  cpi = file.path(raw_dir, "dgei_cpi.xlsx"),
  policy = file.path(raw_dir, "dgei_policy.xlsx")
)

gdp <- read_block(paths$gdp, "G8:K194")
cpi <- read_block(paths$cpi, "G8:K566")
policy <- read_block(paths$policy, "A8:E567")

levels <- merge_all(list(
  rename_value(quarterly_level(gdp$Date, gdp$US), "gdp_us_index"),
  rename_value(quarterly_level(gdp$Date, gdp[["World (ex. U.S.)"]]), "gdp_row_index"),
  rename_value(quarterly_mean_complete(cpi$Date, cpi$US), "cpi_us_qavg"),
  rename_value(quarterly_mean_complete(cpi$Date, cpi[["World (ex. U.S.)"]]), "cpi_row_qavg"),
  rename_value(quarterly_mean_complete(policy$Date, policy$US), "policy_us_annual_qavg"),
  rename_value(quarterly_mean_complete(policy$Date, policy[["World (ex. U.S.)"]]), "policy_row_annual_qavg")
))

levels$previous_date <- previous_quarter(levels$Date)
previous <- levels[, c("Date", "gdp_us_index", "gdp_row_index", "cpi_us_qavg", "cpi_row_qavg")]
names(previous) <- c("previous_date", "gdp_us_lag", "gdp_row_lag", "cpi_us_lag", "cpi_row_lag")
panel <- merge(levels, previous, by = "previous_date", all = FALSE, sort = TRUE)
panel <- panel[order(panel$Date), , drop = FALSE]

panel$quarter <- quarter_label(panel$Date)
panel$g_y_us <- log_change(panel$gdp_us_index, panel$gdp_us_lag)
panel$g_y_row <- log_change(panel$gdp_row_index, panel$gdp_row_lag)
panel$pi_us <- log_change(panel$cpi_us_qavg, panel$cpi_us_lag)
panel$pi_row <- log_change(panel$cpi_row_qavg, panel$cpi_row_lag)
panel$i_us <- panel$policy_us_annual_qavg / 4
panel$i_row <- panel$policy_row_annual_qavg / 4

output <- panel[, c(
  "Date", "quarter",
  "gdp_us_index", "gdp_row_index", "g_y_us", "g_y_row",
  "cpi_us_qavg", "cpi_row_qavg", "pi_us", "pi_row",
  "policy_us_annual_qavg", "policy_row_annual_qavg", "i_us", "i_row"
)]

if (anyNA(output)) stop("The transformed common panel contains missing values.", call. = FALSE)
expected_first <- as.Date("1980-07-01")
expected_last <- as.Date("2026-01-01")
if (output$Date[1L] != expected_first || tail(output$Date, 1L) != expected_last || nrow(output) != 183L) {
  stop(
    sprintf(
      "Coverage changed. Expected 1980Q3-2026Q1 with 183 rows; found %s-%s with %d rows.",
      output$quarter[1L], tail(output$quarter, 1L), nrow(output)
    ),
    call. = FALSE
  )
}

panel_path <- file.path(processed_dir, "dgei_us_row_quarterly.csv")
utils::write.csv(output, panel_path, row.names = FALSE, na = "")

coverage <- data.frame(
  object = c(
    "raw_gdp_row", "raw_gdp_us", "raw_cpi_row", "raw_cpi_us",
    "raw_policy_row", "raw_policy_us", "transformed_common_panel",
    "preferred_pre_gfc_sample"
  ),
  first = c("1980Q2", "1980Q2", "1980-02", "1980-02", "1980-01", "1980-01", "1980Q3", "1984Q1"),
  last = c("2026Q1", "2026Q2", "2026-06", "2026-06", "2026-07", "2026-07", "2026Q1", "2007Q4"),
  observations = c(184L, 185L, 557L, 557L, 559L, 559L, 183L, 96L),
  stringsAsFactors = FALSE
)
utils::write.csv(coverage, file.path(manifest_dir, "dgei_panel_coverage.csv"), row.names = FALSE)

message(sprintf("Wrote %d quarterly observations to %s", nrow(output), panel_path))
