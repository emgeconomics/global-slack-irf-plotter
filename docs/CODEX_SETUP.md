# Codex Setup for the Global Slack Revision

## 1. Canonical repository and branch

```text
Repository: emgeconomics/global-slack-irf-plotter
Development branch: codex/lajcb-r2-smm
Default branch: main
```

All durable work must be committed and pushed to the development branch. Local Codex transcripts are useful working context but are not a substitute for repository documentation.

## 2. Cloud/remote Codex setup

In Codex:

1. Sign in with the ChatGPT account that has access to `emgeconomics/global-slack-irf-plotter`.
2. Connect or authorize GitHub when prompted.
3. Select the repository `emgeconomics/global-slack-irf-plotter`.
4. Create/select an environment for the repository.
5. Set the task branch to `codex/lajcb-r2-smm`; do not work directly on `main`.
6. Allow the environment to install only the dependencies declared by the repository.
7. Start the first task with this instruction:

```text
Read AGENTS.md, docs/DECISIONS.md, docs/REVISION_ROADMAP.md,
docs/MODEL_EXTENSION.md, docs/SMM_DESIGN.md, and docs/PROJECT_LOG.md.
Work only on branch codex/lajcb-r2-smm. Before making changes, report the
current commit and the next unchecked task. Run the relevant tests, update
docs/PROJECT_LOG.md, commit, and push before finishing.
```

The repository-level `AGENTS.md` is the standing instruction file. Add a nested `AGENTS.md` only when a subdirectory requires materially different commands or constraints.

## 3. Local Windows setup

The intended local clone is

```text
C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter
```

### First-time clone

Open PowerShell:

```powershell
cd C:\Users\emart\Dropbox\GitHubData
git clone https://github.com/emgeconomics/global-slack-irf-plotter.git
cd global-slack-irf-plotter
git fetch origin
git switch --track origin/codex/lajcb-r2-smm
```

If the folder already contains a clone:

```powershell
cd C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter
git status
git fetch origin
git switch codex/lajcb-r2-smm
git pull --ff-only
```

### Start Codex locally

Launch Codex from the repository root so it reads the root `AGENTS.md` and treats the clone as the working tree. In the Codex desktop/CLI/IDE client, open:

```text
C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter
```

Then give the same initialization instruction shown in the cloud setup section.

## 4. Importing the approved legacy code

Approved source folder for this revision:

```text
C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK
```

A cloud environment cannot see that Windows folder automatically. Import must be performed locally and reviewed.

Recommended procedure:

1. Create an inventory before copying anything.
2. Exclude temporary files, caches, logs, large unneeded simulation dumps, credentials, and unrelated projects.
3. Copy source code and small reference outputs into a staging directory under the repository.
4. Record the original path, modification time, size, and SHA-256 hash in an import manifest.
5. Commit the import separately from any code changes.
6. Run the legacy baseline and record whether it reproduces the current paper.
7. Move generated outputs into the new versioned run architecture only after the baseline is validated.

Suggested staging structure:

```text
legacy_import/
  manifest.csv
  README.md
  source/
  reference_outputs/
```

Do not retain duplicate or obsolete files merely because they were present in the old folder. Mark exclusions in the manifest.

## 5. Cross-device continuity

The durable state of the project consists of:

- branch commits;
- `AGENTS.md`;
- `docs/PROJECT_LOG.md`;
- `docs/DECISIONS.md`;
- versioned run manifests and outputs;
- issues and pull-request discussion.

At the end of every session:

```powershell
git status
# run tests and reproduction checks
git add <reviewed files>
git commit -m "<descriptive message>"
git push origin codex/lajcb-r2-smm
```

Then update `docs/PROJECT_LOG.md` in the same commit or a follow-up documentation commit. A task is not complete if its only record is in a chat transcript.

## 6. Recommended task boundaries

Use separate Codex tasks for:

1. legacy-code import and baseline reproduction;
2. markup-shock implementation and tests;
3. demand-shock implementation and tests;
4. DGEI data pipeline;
5. SMM objective and estimation;
6. Monte Carlo replication;
7. IRF interface changes;
8. manuscript/appendix patches;
9. figure layout and final quality control.

Each task should begin from a clean branch state and end with a pushed commit and log entry.

## 7. Draft pull request

Open a draft pull request from `codex/lajcb-r2-smm` to `main` after the first reproducible checkpoint. Use the pull request as the consolidated review surface, but keep detailed run history in the repository documents.

Suggested title:

```text
Draft: LACB round-2 quantitative revision and SMM discipline
```

The pull request must remain draft until the old benchmark, new-shock model, SMM results, browser plotter, and manuscript-facing outputs pass their respective checks.

## 8. Recovery on a new device

On any new device:

```powershell
git clone https://github.com/emgeconomics/global-slack-irf-plotter.git
cd global-slack-irf-plotter
git fetch origin
git switch --track origin/codex/lajcb-r2-smm
```

Then instruct Codex to read the root agent guide and all files under `docs/` listed in Section 2. The project should be recoverable without importing a prior chat.
