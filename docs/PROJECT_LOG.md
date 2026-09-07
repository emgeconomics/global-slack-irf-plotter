# Project Log

This is the durable, cross-device record of work on the Global Slack LACB round-2 revision. Add new entries at the top. Do not delete failed attempts; mark them superseded or failed and explain why.

## 2026-08-11 — DGEI audit and stochastic-moment checkpoint

**Branch:** `codex/lajcb-r2-smm`  
**Head commit at checkpoint:** `02852eaf2b1297cb835f8e3a9c47f436d2e2509e`  
**Working pull request:** Draft PR #1  
**CI:** 14 tests passed; 0 failed  
**Status:** Data coverage and moment definitions are frozen; stochastic simulation is reproducible; SMM optimization and legacy-code reconciliation remain pending.

### DGEI data audit completed

The August 2026 DGEI workbooks were audited at exact ranges on the `US Trade Weights` sheet:

```text
Real GDP:   G8:K194, quarterly index, 2005=100
Headline CPI: G8:K566, monthly index, 2005=100
Policy rate: A8:E567, monthly annual percent
```

The selected headers are:

```text
Date | World (ex. U.S.) | Advanced (ex. U.S.) | Emerging | US
```

Raw coverage is continuous after the first usable observation. The transformed common six-variable panel runs from **1980Q3 through 2026Q1**, for **183 quarters**. The preferred Great-Moderation/pre-GFC benchmark is **1984Q1–2007Q4**, for **96 quarters**. The prespecified full-sample robustness excluding 2020Q2–2021Q1 contains 179 quarters.

Added:

- `docs/DGEI_DATA_AUDIT.md`;
- `smm/config/series_crosswalk.csv`;
- `smm/R/build_quarterly_panel.R`;
- benchmark, full-sample, and broad-world-policy JSON configurations.

An external audit workbook was also generated with the quarterly panel, source hashes, coverage checks, transformation notes, and target moments.

### Foreign policy-rate measurement issue

The U.S.-trade-weighted `World (ex. U.S.)` policy-rate aggregate is dominated by extreme emerging-market episodes. In the pre-GFC sample, its quarterly-unit standard deviation is 26.957 percentage points and its maximum annual-percent quarterly average is 993.837 percent. The corresponding `Advanced (ex. U.S.)` values are 0.594 and 9.824 percent.

The documented recommendation, pending author approval, is:

- World ex-U.S. for foreign real GDP and headline CPI;
- Advanced ex-U.S. for the benchmark foreign policy-rate proxy;
- World ex-U.S. policy rate retained as an audit/robustness series.

See `docs/POLICY_RATE_MEASUREMENT.md`. No silent substitution is permitted.

### Stochastic simulator and moment mapping

Added:

- `model/simulation.js`, which generates deterministic-seed, within-family-correlated structural innovations and simulates the linear model by converged impulse-response convolution;
- `model/moments.js`, which computes the frozen 27-moment SMM vector;
- public exports from root `model.js`;
- five additional automated tests.

The current stochastic simulator is reproducible and numerically validated. It uses a finite response horizon rather than an exact state-space recursion. The 160-quarter and 240-quarter IRF solutions differ by at most approximately `5.1e-8` over the first 40 quarters under the paper parameterization. An exact state-space implementation remains preferable for the final high-volume SMM search.

### CI result

GitHub Actions run `31540617920` completed successfully with 14 of 14 tests passing. In addition to the original model tests, CI now checks:

1. fixed-seed innovation reproducibility;
2. configured cross-country innovation correlations;
3. finite-horizon IRF convergence;
4. reproducible stochastic simulations of requested length;
5. a complete finite 27-moment vector.

### Artifacts produced outside the public repository

```text
DGEI_US_ROW_Quarterly_SMM_Panel_Aug2026.xlsx
dgei_us_row_quarterly_smm_aug2026.csv
dgei_smm_data_moments_aug2026.csv
dgei_policy_proxy_moment_comparison_aug2026.csv
GlobalSlack_layout_revision.tex
GlobalSlack_layout_revision.patch
```

The workbook now contains a dedicated policy-rate audit and an alternative target-moment sheet using the Advanced ex-U.S. proxy.

### Remaining blockers and next action

1. The approved legacy folder `C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK` is not visible in this cloud environment. Run the inventory-only import locally and commit the reviewed source checkpoint.
2. The foreign policy-rate benchmark requires author approval.
3. The SMM objective, weighting matrix, optimizer, parameter uncertainty, variance decompositions, and revised Monte Carlo figures remain to be implemented.
4. The browser extension still requires visual QA on the deployed page.
5. The unpublished manuscript and online appendix are maintained outside this public repository; mathematical and layout patches must be integrated in the Overleaf source separately.

The next computational checkpoint is to reconcile the imported legacy simulation code with the eight-shock model, implement an exact or equivalently validated state-space recursion, and produce first-stage SMM estimates for the pre-GFC benchmark.

---

## 2026-08-11 — Eight-shock browser model checkpoint

**Status:** Executable markup/demand extension implemented and tested; this entry's nine-test count was superseded later the same day by the fourteen-test stochastic-moment checkpoint above.

### Implemented

- Refactored the browser model into modular files under `model/` while preserving the public imports from root `model.js`.
- Expanded the model from four to eight structural disturbances:
  - Home and Foreign productivity;
  - Home and Foreign monetary policy;
  - Home and Foreign producer-origin markup shocks;
  - Home and Foreign aggregate-demand/IS wedges.
- Added origin-weighted markup terms to both CPI Phillips curves:

```text
Home:    Phi[xi mu_t + (1-xi) mu*_t]
Foreign: Phi[xi* mu_t + (1-xi*) mu*_t]
```

- Added Home and Foreign demand wedges to the IS equations in output-gap units.
- Added AR(1) state equations, persistence controls, innovation standard deviations, and within-family correlations.
- Added the closed-economy-equivalent Phillips-curve slope helper and inverse mapping to the admissible Calvo parameter.
- Corrected the browser model's treatment of persistent monetary-policy shocks: the `m` and `m*` states now enter their policy rules explicitly. The paper benchmark is unchanged because its monetary-shock persistence is zero.
- Added browser selectors and process panels for markup and demand shocks.

### Qualification

The new markup and demand parameters in `PAPER_PARAMS` are provisional interface/testing placeholders, not empirical estimates.

---

## 2026-08-11 — Revision workspace initialized

**Starting main commit:** `ef0b31f89d8bc7ad1a8394d052313854b3de843e`

### Completed

- Created branch `codex/lajcb-r2-smm` and draft PR #1.
- Added `AGENTS.md`, durable-memory rules, branch and public-repository safeguards.
- Added model, SMM, Codex-setup, decision, and revision-roadmap documents.
- Added an audited PowerShell legacy-import script with an inventory-only safe default and SHA-256 manifests.
- Added the DGEI source registry and reproducible R downloader/manifest scaffold.
- Added `.gitignore` rules for raw workbooks, credentials, caches, and noncanonical runs.
- Prepared separate LaTeX layout edits outside the public repository for the large-blank-space and undersized-figure issues.

### Persistent blockers

1. The approved local folder is not visible in this cloud environment.
2. The public repository does not contain the unpublished manuscript, confidential referee material, bibliography files, or source figure files.
3. The layout-adjusted LaTeX cannot be compiled here without the missing figure and bibliography inputs.
