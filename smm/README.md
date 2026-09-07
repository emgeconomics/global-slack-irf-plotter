# DGEI-Based SMM Package

This directory contains the reproducible quantitative discipline for the LACB round-2 revision.

## Current checkpoint

Implemented:

- official DGEI source registry in `config/sources.csv`;
- audited exact series crosswalk in `config/series_crosswalk.csv`;
- reproducible downloader and SHA-256 manifest in `R/download_dgei.R`;
- quarterly six-observable panel builder in `R/build_quarterly_panel.R`;
- August 2026 schema/coverage audit in `../docs/DGEI_DATA_AUDIT.md`;
- full SMM design in `../docs/SMM_DESIGN.md`;
- executable eight-shock IRF model and automated tests in the repository root.

The audited common transformed sample is **1980Q3–2026Q1** with **183 quarterly observations**. The preferred pre-GFC benchmark is **1984Q1–2007Q4** with **96 observations**.

Pending:

- local execution of the R pipeline and comparison with the independently generated audit panel;
- stochastic state-space simulator;
- moment functions, objective, optimization, and diagnostics;
- pre-GFC and full-sample configuration files;
- SMM estimates and variance decompositions;
- revised Monte Carlo and publication outputs.

## Download source data

From the repository root:

```powershell
Rscript smm/R/download_dgei.R
```

To replace existing raw workbooks with the current website versions:

```powershell
Rscript smm/R/download_dgei.R --force
```

The downloader requires the R package `digest` to compute SHA-256 checksums. Raw workbooks are written to `smm/data/raw/` and are ignored by Git. The version-controlled manifest is written to `smm/data/manifests/dgei_download_manifest.csv`.

## Build the quarterly panel

```powershell
Rscript smm/R/build_quarterly_panel.R
```

The builder requires `readxl`. It validates the workbook headers and August 2026 coverage, then writes:

```text
smm/data/processed/dgei_us_row_quarterly.csv
smm/data/manifests/dgei_panel_coverage.csv
```

Internal SMM units are quarterly log-percentage growth/inflation and quarterly policy rates. Annualized counterparts are presentation objects, not the quantities passed to the objective function.

## Reproducibility rule

Do not run an estimation from an unmanifested workbook. Every processed panel and estimation output must carry the source workbook hashes, retrieval date, code commit, sample, parameter configuration, and random seed.

## Intended commands

The final package will expose:

```text
make data
make estimate-pre-gfc
make estimate-full
make monte-carlo
make figures
make test
```

Equivalent PowerShell wrappers will be included for Windows.
