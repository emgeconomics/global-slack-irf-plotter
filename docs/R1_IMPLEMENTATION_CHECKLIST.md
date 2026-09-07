# R1 Implementation Checklist

## Current validated checkpoint

- [x] Dedicated branch `codex/lajcb-r2-smm` exists.
- [x] Durable repository memory exists in `AGENTS.md`, `PROJECT_LOG.md`, and
  `DECISIONS.md`.
- [x] Producer-origin markup shocks are implemented in the browser model.
- [x] Euler/aggregate-demand wedges are normalized in real-rate-equivalent
  units and passed through both rows of the open-economy IS system.
- [x] The four-shock benchmark is exactly nested when new shock variances are
  zero.
- [x] The JavaScript test suite passes.
- [x] DGEI source and quarterly-panel scripts exist.
- [x] The 27-moment function is frozen and tested.
- [x] R1 manuscript and appendix source patches are prepared outside the public
  repository.

## Local legacy gate

- [ ] Run `scripts/import_legacy.ps1 -Mode Inventory` on the authorized Windows
  folder.
- [ ] Review `legacy_import/inventory.csv` for source, data, output, cache, and
  unrelated files.
- [ ] Copy reviewed source only.
- [ ] Review `legacy_import/import_manifest.csv` and SHA-256 hashes.
- [ ] Identify the untouched legacy driver and software versions.
- [ ] Run the legacy benchmark and save a complete log.
- [ ] Match benchmark IRFs, moments, tables, seeds, and timing conventions.
- [ ] Commit a `BASELINE_REPRODUCTION_REPORT.md` with explicit pass/fail entries.

## DGEI and SMM gate

- [ ] Re-download DGEI workbooks and record hashes/vintages.
- [ ] Verify U.S. and U.S.-trade-weighted rest-of-world series selection.
- [ ] Freeze the 1984Q1-2007Q4 benchmark moments.
- [ ] Freeze the longer-sample robustness moments.
- [ ] Implement parameter transformations and admissibility bounds.
- [ ] Implement deterministic SMM objective tests.
- [ ] Run low-budget multistart smoke estimation.
- [ ] Run high-budget multistart estimation for each profiled Phillips-curve
  slope.
- [ ] Report convergence, profile curvature, moment fit, boundary hits, and
  local-identification diagnostics.
- [ ] Rerun the Monte Carlo exercises under the selected calibration.

## Manuscript and delivery gate

- [ ] Restore `acompat.bib`, `GlobalSlack.bib`, and any required Overleaf style
  assets.
- [ ] Run Biber and resolve every citation/reference.
- [ ] Insert only validated SMM estimates and tables.
- [ ] Compile the main paper and online appendix with no missing assets.
- [ ] Inspect all figure pages, especially Figures 1, 5-7, C1, and C2.
- [ ] Complete the point-by-point response to Reviewer 3.
- [ ] Keep the pull request in draft until all reproduction gates pass.
