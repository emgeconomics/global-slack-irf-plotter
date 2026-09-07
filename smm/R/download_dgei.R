#!/usr/bin/env Rscript

# Download the official Dallas Fed DGEI workbooks used by the SMM exercise and
# record a reproducibility manifest. Raw workbooks are intentionally ignored by
# Git; the manifest and source registry are version controlled.

options(stringsAsFactors = FALSE, warn = 1)

parse_args <- function(args) {
  out <- list(force = FALSE, repo_root = NULL)
  for (arg in args) {
    if (identical(arg, "--force")) {
      out$force <- TRUE
    } else if (startsWith(arg, "--repo-root=")) {
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
    script_arg <- commandArgs(trailingOnly = FALSE)
    file_arg <- grep("^--file=", script_arg, value = TRUE)
    if (length(file_arg) == 1L) {
      script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/", mustWork = TRUE)
      root <- normalizePath(file.path(dirname(script_path), "..", ".."), winslash = "/", mustWork = TRUE)
    } else {
      root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
    }
  }

  if (!file.exists(file.path(root, "AGENTS.md")) ||
      !file.exists(file.path(root, "smm", "config", "sources.csv"))) {
    stop(sprintf("Could not confirm repository root: %s", root), call. = FALSE)
  }
  root
}

sha256_file <- function(path) {
  if (!requireNamespace("digest", quietly = TRUE)) {
    stop(
      paste(
        "Package 'digest' is required for SHA-256 manifests.",
        "Install it with install.packages('digest') or restore the project environment."
      ),
      call. = FALSE
    )
  }
  digest::digest(file = path, algo = "sha256", serialize = FALSE)
}

git_value <- function(root, args) {
  value <- tryCatch(
    system2("git", c("-C", shQuote(root), args), stdout = TRUE, stderr = FALSE),
    error = function(e) character()
  )
  if (length(value) == 0L) NA_character_ else trimws(value[[1L]])
}

args <- parse_args(commandArgs(trailingOnly = TRUE))
repo_root <- find_repo_root(args$repo_root)
source_registry <- file.path(repo_root, "smm", "config", "sources.csv")
raw_dir <- file.path(repo_root, "smm", "data", "raw")
manifest_dir <- file.path(repo_root, "smm", "data", "manifests")
manifest_path <- file.path(manifest_dir, "dgei_download_manifest.csv")

dir.create(raw_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(manifest_dir, recursive = TRUE, showWarnings = FALSE)

sources <- read.csv(source_registry, check.names = FALSE)
required_columns <- c("id", "frequency", "url", "filename")
missing_columns <- setdiff(required_columns, names(sources))
if (length(missing_columns) > 0L) {
  stop(sprintf("Source registry is missing columns: %s", paste(missing_columns, collapse = ", ")), call. = FALSE)
}
if (anyDuplicated(sources$id) || anyDuplicated(sources$filename)) {
  stop("Source ids and filenames must be unique.", call. = FALSE)
}

retrieval_utc <- format(Sys.time(), tz = "UTC", usetz = TRUE)
commit_sha <- git_value(repo_root, c("rev-parse", "HEAD"))
branch <- git_value(repo_root, c("branch", "--show-current"))

rows <- vector("list", nrow(sources))
for (i in seq_len(nrow(sources))) {
  source <- sources[i, , drop = FALSE]
  destination <- file.path(raw_dir, source$filename)
  existed_before <- file.exists(destination)
  action <- if (existed_before && !args$force) "kept_existing" else "downloaded"

  if (!existed_before || args$force) {
    temporary <- paste0(destination, ".download")
    if (file.exists(temporary)) unlink(temporary)

    message(sprintf("Downloading %s from %s", source$id, source$url))
    tryCatch(
      {
        utils::download.file(
          url = source$url,
          destfile = temporary,
          mode = "wb",
          quiet = FALSE,
          method = "libcurl"
        )
        if (!file.exists(temporary) || file.info(temporary)$size <= 0L) {
          stop("Download produced an empty file.")
        }
        if (!file.rename(temporary, destination)) {
          file.copy(temporary, destination, overwrite = TRUE)
          unlink(temporary)
        }
      },
      error = function(e) {
        if (file.exists(temporary)) unlink(temporary)
        stop(sprintf("Failed to download %s: %s", source$id, conditionMessage(e)), call. = FALSE)
      }
    )
  }

  info <- file.info(destination)
  rows[[i]] <- data.frame(
    id = source$id,
    frequency = source$frequency,
    url = source$url,
    local_file = file.path("smm", "data", "raw", source$filename),
    retrieval_utc = retrieval_utc,
    action = action,
    size_bytes = unname(info$size),
    modified_utc = format(info$mtime, tz = "UTC", usetz = TRUE),
    sha256 = sha256_file(destination),
    git_commit = commit_sha,
    git_branch = branch,
    r_version = R.version.string,
    platform = R.version$platform,
    stringsAsFactors = FALSE
  )
}

manifest <- do.call(rbind, rows)
utils::write.csv(manifest, manifest_path, row.names = FALSE, na = "")

message(sprintf("Wrote manifest: %s", manifest_path))
message(sprintf("Downloaded/verified %d DGEI workbooks.", nrow(manifest)))
