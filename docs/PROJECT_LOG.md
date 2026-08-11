# Project Log

This is the durable, cross-device record of work on the Global Slack LACB round-2 revision. Add new entries at the top. Do not delete failed attempts; mark them superseded or failed and explain why.

## 2026-08-11 — Revision workspace initialized

**Branch:** `codex/lajcb-r2-smm`  
**Starting main commit:** `ef0b31f89d8bc7ad1a8394d052313854b3de843e`  
**Working pull request:** Draft PR #1  
**Status:** Completed repository/design/bootstrap checkpoint; legacy-code import, executable model extension, and estimation remain pending.

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
- Opened draft pull request #1 from `codex/lajcb-r2-smm` to `main` as the consolidated review surface.
- Added `AGENTS.md` with source hierarchy, branch policy, public-repository boundary, economic conventions, testing standards, figure standards, and mandatory durable-memory protocol.
- Added `docs/DECISIONS.md` with the initial adopted/provisional modeling and estimation decisions.
- Added `docs/REVISION_ROADMAP.md` mapping the revision into nine workstreams and acceptance criteria.
- Added `docs/MODEL_EXTENSION.md` with the markup-shock and aggregate-demand-shock equations, state-vector expansion, alternative-pricing implications, slope mapping, and required tests.
- Added `docs/SMM_DESIGN.md` with exact DGEI source URLs, quarterly transformations, sample plan, 17-parameter benchmark, 27 target moments, weighting matrix, optimizer protocol, identification diagnostics, and output architecture.
- Added `docs/CODEX_SETUP.md` with cloud and Windows setup instructions, the approved legacy-code import procedure, and cross-device recovery protocol.
- Added `.gitignore` rules for raw DGEI files, local caches, credentials, and noncanonical estimation runs.
- Added `scripts/import_legacy.ps1`, a two-stage audited import tool that inventories the approved Windows source folder, computes SHA-256 hashes, classifies files, copies only selected source/reference outputs, checks the working branch and cleanliness, and optionally commits/pushes after review.
- Added the initial SMM package scaffold:
  - `smm/config/sources.csv` with the three official DGEI workbook URLs;
  - `smm/R/download_dgei.R` with reproducible downloads and SHA-256 manifests;
  - `smm/README.md` and retained raw-data directory structure.

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
- Confirmed the branch and draft pull request were created successfully.
- Confirmed each design, setup, and bootstrap file was committed to the development branch.
- Confirmed the official DGEI download endpoints resolve to Excel workbooks.

### Unverified bootstrap code

- `scripts/import_legacy.ps1` has been reviewed for branch, checksum, classification, and safe default behavior, but it has not been executed in this cloud session because the approved Windows source folder is unavailable here.
- `smm/R/download_dgei.R` has been reviewed for deterministic paths, checksums, atomic replacement, and manifest fields, but it has not been run inside the user's local R environment. It requires the `digest` package.

### Blocked or not yet performed

1. **Legacy simulation code not inspected.** The approved Windows folder
   `C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK`
   is not visible to this cloud session. It must be inventoried/imported locally or attached before its contents can be audited.
2. **No source figure files in the GitHub repository.** The compiled manuscript exposes the layout problems, but accurate crop values and regenerated vector figures require the underlying `Figures/` files or plotting scripts.
3. **No manuscript source committed.** The repository is public, so the current unpublished manuscript and confidential referee materials were deliberately not uploaded.
4. **No workbook schema audit or SMM run yet.** Exact series labels, coverage, and common sample must be audited before freezing the sample and parameter reduction.
5. **No executable model change yet.** `model.js`, `app.js`, and `index.html` still implement the four-shock model at this checkpoint. This is intentional until the current benchmark can be captured in automated tests and compared with the imported legacy code.

### Next action

From the local repository on branch `codex/lajcb-r2-smm`, run the inventory-only legacy import:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\import_legacy.ps1 -Mode Inventory
```

Review `legacy_import/inventory.csv`, then perform the reviewed source import. The next Codex task should add automated baseline tests around the unchanged JavaScript model and reproduce the current paper benchmark before implementing the markup and demand shocks.
