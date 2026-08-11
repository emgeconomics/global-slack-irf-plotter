# LACB Round-2 Revision Roadmap

## Objective and deadline

Prepare a complete second-round revision of *The Global Slack Hypothesis and the Open-Economy Phillips Curve* for submission by **2026-09-04**. The remaining referee asks for three changes: reframe the empirical narrative around heterogeneous evidence; clarify that the VAR/VARMA representation is an analytical instrument rather than the contribution itself; and demonstrate that the paper's quantitative findings are not an artifact of the current shock structure and steep Phillips curve.

This repository is responsible primarily for the third workstream and for the reproducible figure and code infrastructure. Narrative and manuscript changes must remain synchronized with the quantitative results.

## Workstream 1 — Repository and reproducibility foundation

### Tasks

- [x] Create development branch `codex/lajcb-r2-smm`.
- [x] Add root `AGENTS.md` and durable project-memory protocol.
- [x] Add decisions, roadmap, model-extension, SMM-design, and project-log documents.
- [ ] Import the latest executable simulation/Monte Carlo code from the approved local folder.
- [ ] Inventory every imported file and classify it as source, generated output, legacy, or obsolete.
- [ ] Add dependency lockfiles, one-command entry points, and automated tests.
- [ ] Record a reproducible baseline checkpoint matching the current paper's tables and figures before changing the model.

### Acceptance criterion

A clean clone can reproduce the current benchmark outputs with documented commands and fixed seeds before the new shocks are switched on.

## Workstream 2 — Mathematical model extension

### Tasks

- [ ] Add Home and Foreign origin-specific markup shocks to the Calvo reset-price equations.
- [ ] Aggregate the markup wedges into Home and Foreign CPI Phillips curves under PCP.
- [ ] Verify the corresponding LCP, hybrid PCP/LCP, and Home-currency DCP expressions in the online appendix.
- [ ] Add Home and Foreign aggregate-demand/IS wedges.
- [ ] Add AR(1) laws, innovation variances, and cross-country correlations for the new shocks.
- [ ] Expand the forcing vector and covariance matrix in the reduced-form derivation.
- [ ] Recalculate finite-order VAR/VARMA and ARDL–MA order bounds, noting where the bounds are unchanged but rank properties improve.
- [ ] Prove and test that setting all new-shock variances to zero recovers the current model exactly.

### Acceptance criterion

The manuscript, online appendix, JavaScript model, simulation model, and SMM model use identical equations, notation, shock scaling, and sign conventions.

## Workstream 3 — DGEI data pipeline

### Data

- Real GDP: DGEI quarterly workbook.
- Headline CPI: DGEI monthly workbook.
- Short-term official/policy rates: DGEI monthly workbook.
- Geography: United States and rest of world excluding the United States.
- Foreign aggregation: U.S.-trade weights.

### Tasks

- [ ] Download source workbooks and preserve checksums and retrieval date.
- [ ] Identify exact workbook rows/columns and series labels.
- [ ] Create a tidy quarterly panel with six observables.
- [ ] Convert monthly CPI indexes to quarterly average indexes, then annualized quarter-on-quarter log inflation.
- [ ] Convert monthly policy rates to quarterly averages.
- [ ] Compute real GDP annualized quarter-on-quarter log growth from quarterly levels.
- [ ] Audit missing values, breaks, revisions, outliers, and common sample coverage.
- [ ] Preserve both raw and transformed data dictionaries and provenance.

### Acceptance criterion

The quarterly estimation panel is generated from downloaded DGEI files by one script, with no hand-edited observations and with a machine-readable provenance manifest.

## Workstream 4 — SMM design and estimation

### Benchmark observables

```text
[g_y_US, g_y_ROW, pi_US, pi_ROW, i_US, i_ROW]
```

### Benchmark samples

- Pre-GFC/Great-Moderation sample ending 2007Q4.
- Full common sample beginning in the early 1980s and ending at the latest common quarter.

### Tasks

- [ ] Freeze calibrated structural parameters and report their sources.
- [ ] Finalize a parsimonious estimated parameter vector.
- [ ] Freeze the target-moment vector and its transformation conventions.
- [ ] Implement common-random-number simulation with deterministic seeds.
- [ ] Implement bounded parameter transforms and multi-start optimization.
- [ ] Estimate a first-stage diagonal-weight SMM.
- [ ] Estimate a second-stage SMM using a block-bootstrap estimate of the moment covariance matrix.
- [ ] Report objective contributions, moment fit, parameter bounds, sensitivity to starts, and numerical diagnostics.
- [ ] Generate model-vs-data moment tables and variance decompositions.
- [ ] Evaluate the benchmark and alternative samples under an explicitly documented ELB/pandemic treatment.

### Acceptance criterion

The revised calibration produces substantially more realistic relative volatility, persistence, and comovement for inflation, GDP growth, and policy rates while preserving the paper's qualitative measurement-error mechanism.

## Workstream 5 — Monte Carlo and empirical-relevance results

### Tasks

- [ ] Re-run the representative-sample scatterplot under the SMM-disciplined parameterization.
- [ ] Re-run the long-sample projection and finite-sample Monte Carlo exercises.
- [ ] Compare true-gap and proxy-gap regression results under old and new parameterizations.
- [ ] Re-run robustness grids for country size/openness, trade elasticity, and shock comovement.
- [ ] Add a compact comparison showing which original conclusions survive quantitative discipline.
- [ ] Archive raw Monte Carlo draws or sufficient summary statistics with seeds and configuration files.

### Acceptance criterion

The revised paper can state precisely which findings are robust and which are calibration-dependent. It must not claim a universal failure of statistical filters.

## Workstream 6 — IRF plotter update

### Tasks

- [ ] Add markup and demand shock parameters and selectors to the browser interface.
- [ ] Add Home and Foreign markup-shock IRFs.
- [ ] Add Home and Foreign demand-shock IRFs.
- [ ] Preserve the current four-shock results exactly when new shocks are disabled.
- [ ] Add display of the closed-economy-equivalent Phillips-curve slope.
- [ ] Add downloadable parameter/run metadata with IRF CSV files.
- [ ] Add automated browser-model tests and a small deterministic reference fixture.
- [ ] Update README and implementation notes.

### Acceptance criterion

The hosted static page solves all eight shock experiments, handles invalid parameterizations gracefully, and exports enough metadata to reproduce each plotted response.

## Workstream 7 — Manuscript and online appendix

### Narrative

- [ ] Retitle and rewrite Section 3 around heterogeneous findings across empirical designs.
- [ ] Revise abstract, introduction, Section 3, and conclusion so VAR/VARMA is described as an instrument exposing model restrictions.
- [ ] Integrate more recent global-slack evidence and distinguish mixed from uniformly weak evidence.

### Quantitative model

- [ ] Update model-environment text and parameter tables.
- [ ] Update Table A1 shock parameters and Table A3 model equations.
- [ ] Update forcing-vector and covariance-matrix notation in Appendix B.
- [ ] Add SMM methodology, data, moments, estimated parameters, and fit discussion.
- [ ] Replace or augment benchmark simulation tables and figures.
- [ ] Update limitations and interpretation.

### Online appendix

- [ ] Add markup wedges at the primitive reset-price level.
- [ ] Derive PCP, LCP, hybrid, and DCP CPI Phillips curves with the new wedges.
- [ ] Add demand wedges to the AD block and workhorse summary tables.
- [ ] Add implementation-ready state-space system.
- [ ] Cross-check every main-paper equation against the appendix.

### Acceptance criterion

No equation, parameter definition, table, figure note, or verbal interpretation refers to the old four-shock model where the revised eight-shock model is intended.

## Workstream 8 — Figure layout and publication quality

### Tasks

- [ ] Replace forced `[H]` placement where it creates large blank areas.
- [ ] Crop internal whitespace in source figure exports.
- [ ] Enlarge Figures 5–7 and Appendix Figures C1–C2 without reducing font legibility.
- [ ] Keep figures close to first reference with controlled float barriers.
- [ ] Compile and visually inspect every page after float changes.
- [ ] Verify that captions, notes, and panel labels remain readable at journal-page size.

### Acceptance criterion

The compiled manuscript has no conspicuous blank pages or undersized figure panels, and all figures remain within margins in both screen and print rendering.

## Workstream 9 — Referee response and release checkpoint

### Tasks

- [ ] Draft a point-by-point response with exact manuscript page/line references.
- [ ] Explain the new shocks and SMM discipline without overstating structural estimation.
- [ ] State transparently which parameters remain calibrated.
- [ ] Document all robustness exercises and non-addressed requests.
- [ ] Run a clean-clone replication test.
- [ ] Tag the submission checkpoint and archive hashes of manuscript, appendix, code, data vintage, and outputs.

### Acceptance criterion

A third party can trace each referee comment to a manuscript change and reproduce every revised quantitative claim from the tagged repository state.
