# DGEI-Based SMM Package

This directory contains the reproducible quantitative discipline for the LACB round-2 revision.

## Current checkpoint

Implemented:

- official DGEI source registry in `config/sources.csv`;
- reproducible downloader and SHA-256 manifest in `R/download_dgei.R`;
- full design in `../docs/SMM_DESIGN.md`.

Pending:

- workbook schema audit and exact series crosswalk;
- quarterly panel builder;
- expanded stochastic model;
- moment functions, objective, optimization, and diagnostics;
- pre-GFC and full-sample configuration files;
- Monte Carlo and publication outputs.

## Download source data

From the repository root:

```powershell
Rscript smm/R/download_dgei.R
```

To replace existing raw workbooks with the current website versions:

```powershell
Rscript smm/R/download_dgei.R --force
```

The script requires the R package `digest` to compute SHA-256 checksums. Raw workbooks are written to `smm/data/raw/` and are ignored by Git. The version-controlled manifest is written to `smm/data/manifests/dgei_download_manifest.csv`.

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
