# Project Log

This is the durable, cross-device record of work on the Global Slack LACB round-2 revision. Add new entries at the top. Do not delete failed attempts; mark them superseded or failed and explain why.

## 2026-08-11 — Eight-shock browser model checkpoint

**Branch:** `codex/lajcb-r2-smm`  
**Working pull request:** Draft PR #1  
**Status:** Executable markup/demand extension implemented and locally tested; SMM estimation, legacy-code reconciliation, manuscript integration, and visual browser QA remain pending.

### Implemented

- Refactored the browser model into modular files under `model/` while preserving the public imports from root `model.js`.
- Expanded the model from four to eight structural disturbances:
  - Home and Foreign productivity;
  - Home and Foreign monetary policy;
  - Home and Foreign producer-origin markup shocks;
  - Home and Foreign aggregate-demand/IS wedges.
- Added origin-weighted markup terms to both CPI Phillips curves:

```text
Home:   Phi[xi mu_t + (1-xi) mu*_t]
Foreign: Phi[xi* mu_t + (1-xi*) mu*_t]
```

- Added Home and Foreign demand wedges to the IS equations in output-gap units.
- Added AR(1) state equations, persistence controls, innovation standard deviations, and displayed within-family correlations for the new shocks.
- Added the closed-economy-equivalent Phillips-curve slope helper and the inverse mapping from that slope to the admissible Calvo parameter.
- Corrected the browser model's treatment of persistent monetary-policy shocks: the `m` and `m*` states now enter their policy rules explicitly. The paper benchmark is unchanged because its monetary-shock persistence is zero.
- Added `revision-ui.js`, loaded only in a browser through the model entry point. It adds four new selectable shock scenarios and separate process panels for `mu`, `mu*`, `d`, and `d*` without coupling the numerical model to the DOM.
- Added `npm test` and `tests/model.test.js`.

### Test result

Local Node test suite completed successfully:

```text
9 tests passed; 0 failed
```

Coverage includes:

1. benchmark parameter admissibility;
2. the Phillips-curve slope adding-up restriction;
3. slope-to-Calvo inversion;
4. finite solutions for all eight shocks;
5. positive markup-shock inflation signs;
6. positive demand-shock output-gap signs;
7. AR(1) persistence of monetary, markup, and demand states;
8. noninterference of new-shock parameters with an unselected productivity-shock IRF;
9. exact zero responses when a selected innovation standard deviation is zero.

### Important qualification

The new markup and demand parameter values in `PAPER_PARAMS` are explicit **provisional placeholders** for interface/testing purposes. They are not empirical estimates and must be replaced by the DGEI-based SMM results before publication. The current test suite validates equations, signs, persistence, and numerical operation; it does not establish empirical fit.

### Not yet verified

- The hosted page has not been visually inspected in a real browser after these changes.
- The expanded JavaScript model has not yet been reconciled line by line with the approved legacy simulation code, because the local Windows source folder is unavailable to this cloud session.
- No stochastic state-space simulator or unconditional-moment engine has yet been added for SMM.
- No Monte Carlo paper figures have yet been regenerated under the extended model.

### Next action

Run the legacy inventory/import locally, reproduce the current paper benchmark, and compare the imported simulation equations against the modular browser equations. Then freeze a common executable state-space model for the IRFs, Monte Carlo experiments, and SMM objective.

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

### Data-source design

The planned SMM panel uses Dallas Fed DGEI real GDP, headline CPI, and short-term official/policy rates for the United States and the rest of the world excluding the United States, with U.S.-trade weights. The preferred benchmark sample ends in 2007Q4; a full-sample exercise will be reported as a robustness/stress test.

### Persistent blockers

1. The approved local folder `C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK` is not visible in this cloud environment.
2. The public repository does not contain the unpublished manuscript, confidential referee material, bibliography files, or source figure files.
3. Exact DGEI workbook series labels and common coverage have not yet been audited.
4. The layout-adjusted LaTeX cannot be compiled here without the missing figure and bibliography inputs.
