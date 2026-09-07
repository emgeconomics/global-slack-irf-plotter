# Windows Node.js, npm, and Codex Setup — R1

## Why `npm` was not recognized

The repository clone succeeded. The failure occurred before any project code
ran: Windows could not find `npm`, which normally means that Node.js/npm is not
installed or that the current PowerShell process has not reloaded the updated
`PATH`.

This repository has no third-party JavaScript dependencies. `npm test` is only
a convenient command for invoking Node's built-in test runner. Do not run
`npm install` in the repository merely to fix the missing command.

## Recommended repair

From PowerShell:

```powershell
cd C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter

git fetch origin
git switch codex/lajcb-r2-smm
git pull --ff-only

powershell -ExecutionPolicy Bypass `
  -File .\scripts\install_node_lts_and_validate.ps1
```

The helper script uses Windows Package Manager to install the current Node.js
LTS package when necessary, refreshes the process `PATH`, reports the exact
`node.exe` and `npm.cmd` paths, and runs the repository tests.

For a fully manual installation:

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget `
  --accept-source-agreements --accept-package-agreements
```

After installation, close **every** PowerShell window and open a new one. Then
verify:

```powershell
where.exe node
where.exe npm
node --version
npm.cmd --version
```

Use `npm.cmd` rather than `npm` when a restrictive PowerShell execution policy
tries to invoke `npm.ps1` instead of the command shim.

## Validate the checked-out branch

```powershell
cd C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter

git status
git branch --show-current
git pull --ff-only
npm.cmd test
```

Expected branch:

```text
codex/lajcb-r2-smm
```

Do not continue if `git status` reports unexplained local changes or the test
suite has any failure.

## Bootstrap the local Codex workspace

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\scripts\bootstrap_codex_workspace.ps1
```

The bootstrap script checks the clone, updates the branch by fast-forward only,
and runs the test suite.

## First Codex task

Open the local repository in Codex and begin with:

```text
Read AGENTS.md, docs/PROJECT_LOG.md, docs/DECISIONS.md,
docs/MODEL_EXTENSION.md, docs/ZETA_EULER_WEDGE_R1.md,
docs/DEMAND_WEDGE_NORMALIZATION.md, docs/SMM_DESIGN.md,
docs/QUANTITATIVE_OUTPUT_REGISTER_R1.md,
docs/R1_IMPLEMENTATION_CHECKLIST.md, and
docs/WINDOWS_NODE_AND_CODEX_R1.md before changing anything.

Confirm that the active branch is codex/lajcb-r2-smm and report the exact
commit. Run npm.cmd test. Verify that the executable model uses only the
canonical state names zeta and zetastar and contains no d/dstar compatibility
aliases. Do not modify the authorized legacy package. Identify the first
unresolved reproduction gate and stop if any prerequisite is missing.
```

## Inventory the authorized legacy package

Once the tests pass:

```powershell
.\scripts\import_legacy.ps1 `
  -Mode Inventory `
  -Source "C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK"
```

Review:

```text
legacy_import\inventory.csv
```

before copying or committing anything. The source directory is authorized for
this revision task, but it can contain licensed data, unpublished manuscript
material, caches, or unrelated files that must not enter the public GitHub
repository.

## Baseline-reproduction task for Codex

After inventory review, give Codex this task:

```text
Treat the authorized legacy package as an immutable reference implementation.
Identify the actual top-level driver, required software and package versions,
original parameter files, random seeds, data dependencies, and expected
outputs. Run the submitted-paper benchmark without altering the reference
files. Compare every reproducible IRF, table, figure input, simulation moment,
and reported coefficient with the submitted version. Create
docs/BASELINE_REPRODUCTION_REPORT.md using PASS, FAIL, BLOCKED, and NOT RUN.
Explain every discrepancy. Update docs/PROJECT_LOG.md and stop for review
before porting the markup and zeta/zetastar extensions into the legacy code.
```

## Gate after baseline reproduction

Only after the untouched benchmark passes should Codex:

1. run the DGEI download and quarterly-panel scripts;
2. record source URLs, retrieval dates, workbook labels, and SHA-256 hashes;
3. freeze the pre-GFC and longer-sample empirical moments;
4. run low-budget SMM smoke tests;
5. run the high-budget Phillips-curve-slope profile;
6. report convergence, boundary hits, profile curvature, identification, and
   moment contributions;
7. rerun the Monte Carlo exercises and regenerate manuscript outputs.
