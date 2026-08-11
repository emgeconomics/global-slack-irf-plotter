# Project Log

This is the durable, cross-device record of work on the Global Slack LACB round-2 revision. Add new entries at the top. Do not delete failed attempts; mark them superseded or failed and explain why.

## 2026-08-11 — Revision workspace initialized

**Branch:** `codex/lajcb-r2-smm`  
**Starting main commit:** `ef0b31f89d8bc7ad1a8394d052313854b3de843e`  
**Status:** Completed documentation/design checkpoint; code import and implementation pending.

### Request

Create a GitHub-backed Codex workspace for the LACB second-round revision, preserve durable project memory, extend the model with markup and demand shocks, design an SMM exercise using DGEI U.S. and rest-of-world data, update the simulation/IRF code, revise the paper and online appendix, and correct figure layout.

### Repository audit

The `main` branch contains only the static browser plotter and deployment files:

```text
.github/workflows/pages.yml
.nojekyll
LICENSE
README.md
app.js
index.html
model.js
package.json
styles.css
```

The current browser model contains 15 endogenous/state variables and four shock processes: Home/Foreign productivity and Home/Foreign monetary-policy shocks. The current `package.json` only declares ES-module mode and has no test scripts or dependency lockfile.

### Completed

- Created development branch `codex/lajcb-r2-smm` from `main`.
- Added `AGENTS.md` with source hierarchy, branch policy, public-repository boundary, economic conventions, testing standards, figure standards, and mandatory durable-memory protocol.
- Added `docs/DECISIONS.md` with the initial adopted/provisional modeling and estimation decisions.
- Added `docs/REVISION_ROADMAP.md` mapping the revision into nine workstreams and acceptance criteria.
- Added `docs/MODEL_EXTENSION.md` with the markup-shock and aggregate-demand-shock equations, state-vector expansion, alternative-pricing implications, slope mapping, and required tests.
- Added `docs/SMM_DESIGN.md` with exact DGEI source URLs, quarterly transformations, sample plan, 17-parameter benchmark, 27 target moments, weighting matrix, optimizer protocol, identification diagnostics, and output architecture.
- Added `docs/CODEX_SETUP.md` with cloud and Windows setup instructions, the approved legacy-code import procedure, and cross-device recovery protocol.

### Data-source verification

Verified the official Dallas Fed DGEI pages and exact workbook URLs for:

- quarterly real GDP;
- monthly headline CPI;
- monthly short-term official/policy rates.

The official DGEI documentation states that real GDP is quarterly, the other series are monthly, rest-of-world-ex-U.S. aggregates are available, and the aggregation schemes include U.S.-trade weights.

### Mathematical decisions at this checkpoint

- Use origin-specific Home and Foreign markup shocks.
- Aggregate markup shocks into CPI inflation with the consumption-basket weights.
- Add country-specific reduced-form IS wedges in output-gap units.
- Keep potential output and natural rates driven only by productivity in the benchmark extension.
- Discipline a limited parameter vector with six DGEI observables rather than undertake full structural estimation.
- Target the closed-economy-equivalent Phillips-curve slope `Phi(gamma + varphi)` and map it to the admissible Calvo `alpha`.

### Successful checks

- Confirmed GitHub write/admin permission for `emgeconomics/global-slack-irf-plotter`.
- Confirmed that `main` was the only pre-existing branch.
- Confirmed the branch was created successfully.
- Confirmed each design/documentation file was committed to the development branch.

### Blocked or not yet performed

1. **Legacy simulation code not inspected.** The approved Windows folder
   `C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK`
   is not visible to this cloud session. It must be imported locally or attached before its contents can be audited.
2. **No source figure files in the GitHub repository.** The compiled manuscript exposes the layout problems, but accurate crop values and regenerated vector figures require the underlying `Figures/` files or plotting scripts.
3. **No manuscript source committed.** The repository is public, so the current unpublished manuscript and confidential referee materials were deliberately not uploaded.
4. **No SMM run yet.** Workbook series labels, coverage, and common sample must be audited before freezing the exact sample and parameter reduction.
5. **No code changes yet.** `model.js`, `app.js`, and `index.html` still implement the four-shock model on this checkpoint.

### Next action

Import the approved legacy code into a separate commit with a checksum manifest and reproduce the current paper's benchmark before modifying equations. In parallel, add automated tests around the existing JavaScript model so backward compatibility can be measured when the new shocks are introduced.
