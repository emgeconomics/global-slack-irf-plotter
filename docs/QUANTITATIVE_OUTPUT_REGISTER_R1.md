# Quantitative Output Register — R1

## Publication rule

No DGEI panel, empirical moment vector, SMM estimate, profile objective,
Monte Carlo result, or manuscript table is paper-ready unless it is tied to:

1. a data-vintage manifest with source URLs and SHA-256 hashes;
2. the exact Git commit and configuration file;
3. a complete run log and software-version record;
4. a validation report that distinguishes passed, failed, blocked, and not-run checks.

Earlier exploratory files must not be silently relabeled as validated results.

## Data products

| Artifact | Canonical location | Status |
|---|---|---|
| Raw DGEI workbook manifest | `smm/data/raw/manifest.csv` | Pending fresh local download |
| Quarterly U.S.–ROW panel (CSV) | `smm/data/processed/dgei_us_row_quarterly.csv` | Pending series/vintage audit |
| Quarterly U.S.–ROW panel (XLSX) | `outputs/smm/dgei_us_row_quarterly_R1.xlsx` | Pending validated CSV |
| Pre-GFC empirical moments | `outputs/smm/empirical_moments_pre_gfc.csv` | Pending panel validation |
| Longer-sample empirical moments | `outputs/smm/empirical_moments_full_sample.csv` | Pending panel validation |

The six intended observables are U.S. and U.S.-trade-weighted rest-of-world
real GDP growth, headline CPI inflation, and short-term official/policy rates.
The preferred benchmark sample is 1984Q1–2007Q4; the longer sample beginning in
1980 is a prespecified robustness exercise.

## Estimation products

| Artifact | Canonical location | Status |
|---|---|---|
| Profile objective by Phillips-curve slope | `outputs/smm/profile_objective_<sample>.csv` | Pending legacy reproduction |
| Conditional parameter estimates | `outputs/smm/parameter_estimates_<sample>.csv` | Pending estimation |
| Empirical-versus-simulated moment fit | `outputs/smm/moment_fit_<sample>.csv` | Pending estimation |
| Selected-calibration IRFs | `outputs/irf/selected_calibration_<sample>.csv` | Pending model selection |
| SMM summary | `outputs/smm/SMM_SUMMARY_R1.md` and `.xlsx` | Schema preserved; estimates not frozen |
| Monte Carlo tables and figures | `outputs/monte_carlo/` | Pending baseline reproduction and SMM |

## Validation products

| Artifact | Canonical location | Status |
|---|---|---|
| JavaScript tests | `tests/model.test.js` | Implemented and passing on the R1 branch |
| CI test log | GitHub Actions `Model tests` | Must pass after every model change |
| Legacy inventory | `legacy_import/inventory.csv` | Pending local authorized run |
| Controlled import manifest | `legacy_import/import_manifest.csv` | Pending inventory review |
| Baseline reproduction report | `docs/BASELINE_REPRODUCTION_REPORT.md` | Pending untouched legacy run |
| Consolidated validation summary | `outputs/validation/VALIDATION_SUMMARY_R1.md` and `.xlsx` | Code gate active; data/legacy/SMM gates pending |

## Current interpretation

The repository contains a complete, testable design and implementation
framework. It does **not** yet contain paper-ready numerical SMM estimates or a
validated processed DGEI panel. This distinction is deliberate: the next gate
is to inventory and reproduce the authorized legacy package locally, then
re-download and hash the DGEI inputs before freezing any numerical output.
