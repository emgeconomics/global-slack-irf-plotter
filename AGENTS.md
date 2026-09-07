# Global Slack Revision Agent Guide

## Mission

This repository is the canonical, cross-device workspace for the second-round revision of **The Global Slack Hypothesis and the Open-Economy Phillips Curve** and for the associated browser IRF plotter and quantitative replication package.

The immediate objective is to answer the remaining quantitative referee concern by:

1. extending the two-country PCP benchmark with Home and Foreign markup shocks;
2. adding a parsimonious Home and Foreign aggregate-demand/IS wedge;
3. disciplining shock processes and a limited Phillips-curve-slope parameter with DGEI moments for the United States and the rest of the world excluding the United States;
4. reproducing the paper's simulations and figures from version-controlled code; and
5. preserving a transparent record of decisions, successful runs, failed runs, and unresolved issues.

## Source hierarchy

Use the following hierarchy when sources conflict:

1. the current manuscript and online-appendix LaTeX sources supplied by Enrique Martínez-García;
2. `docs/DECISIONS.md` and `docs/MODEL_EXTENSION.md` on this branch;
3. the current executable model and tests in this repository;
4. older code copied from `C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK`;
5. comments in legacy scripts.

Do not silently reconcile discrepancies. Record each discrepancy in `docs/PROJECT_LOG.md`, state which source was followed, and add a test whenever the discrepancy affects numerical results.

## Branch and review policy

- Development branch for this revision: `codex/lajcb-r2-smm`.
- Do not commit revision work directly to `main`.
- Keep commits small, descriptive, and reproducible.
- Open or update a draft pull request once a coherent checkpoint exists.
- Never merge to `main` without Enrique's explicit approval.
- This repository is public. Do not add confidential referee correspondence, private email, unpublished manuscript source, proprietary data, credentials, or institutionally restricted files without explicit approval.

## Durable memory

Chat history is not the project record. At the end of every substantive task:

1. update `docs/PROJECT_LOG.md` with the date, branch/commit, work completed, commands run, outputs, failures, unresolved questions, and next action;
2. update `docs/DECISIONS.md` when a modeling, data, or estimation choice is adopted or reversed;
3. store machine-readable run metadata beside each output, including parameter values, sample, seed, code commit, data vintage, and objective value;
4. never overwrite a failed-run record—mark it failed and explain why.

A researcher opening the repository on a new device should be able to reconstruct the state of the project from those files without access to any prior chat.

## Economic conventions

### Country mapping

- Home = United States.
- Foreign = rest of world excluding the United States.
- Baseline foreign aggregates use DGEI U.S.-trade weights.
- The zero-steady-state-trade-balance restriction remains
  `xi_star = n * (1 - xi) / (1 - n)`.

### Relative prices

- Home terms of trade are the price of imports relative to exports.
- An increase is a deterioration in the Home terms of trade.
- Under PCP, the Home terms-of-trade gap is `(x - x_star) / D`.
- The Foreign terms of trade and real exchange rate are the negatives of the corresponding Home log deviations.

### Added disturbances

Use origin-specific producer markup shocks and country-specific aggregate-demand wedges.

Home CPI Phillips curve:

```text
pi_t = beta E_t pi_{t+1}
       + Phi [Psi_pi,x x_t + Psi_pi,x* x*_t
              + xi mu_t + (1-xi) mu*_t].
```

Foreign CPI Phillips curve:

```text
pi*_t = beta E_t pi*_{t+1}
        + Phi [Psi_pi*,x x_t + Psi_pi*,x* x*_t
               + xi* mu_t + (1-xi*) mu*_t].
```

The positive sign convention means a positive `mu` innovation raises desired markups/cost pressure and inflation, all else equal.

Home IS equation:

```text
x_t = E_t x_{t+1}
      - (1/gamma)[Lambda_x,i r^g_t - Lambda_x,i* r^{g*}_t]
      + d_t.
```

Foreign IS equation:

```text
x*_t = E_t x*_{t+1}
       - (1/gamma)[-Lambda_x*,i r^g_t + Lambda_x*,i* r^{g*}_t]
       + d*_t.
```

The demand wedges are reduced-form shifters of desired expenditure. Do not label them as a fully microfounded preference shock unless the primitive utility specification is also changed and re-derived.

Markup and demand shocks do not change the efficient flexible-price allocation, potential output, or natural rates in the benchmark extension. Any alternative convention requires an explicit decision entry and a complete re-derivation.

## Quantitative discipline

The baseline SMM exercise uses six quarterly observables:

- Home and Foreign real GDP growth;
- Home and Foreign headline CPI inflation;
- Home and Foreign short-term official/policy rates.

Data sources are the Dallas Fed DGEI workbooks documented in `docs/SMM_DESIGN.md`. Convert monthly CPI indexes to quarterly average indexes before computing annualized quarter-on-quarter log inflation. Convert monthly policy rates to quarterly averages. Never average already-computed monthly inflation rates as a substitute for quarterly CPI inflation.

Estimate only a deliberately limited parameter vector. Keep the remaining structural parameters calibrated and report them. Use common random numbers, fixed seeds, parameter bounds, multiple starting values, and versioned moment definitions. Preserve both the pre-GFC/Great-Moderation and full-sample estimates.

## Coding standards

- The web plotter must remain a static browser application with no server dependency.
- Keep the economic model separate from interface code.
- New model functionality must be covered by automated tests.
- Required tests include: zero-new-shock backward compatibility; shock-process persistence; sign conventions; Home/Foreign symmetry checks where applicable; zero-trade-balance accounting; finite solutions; and reproducibility under fixed seeds.
- Do not round parameters internally merely to match displayed values.
- Fail loudly for singular, indeterminate, explosive, non-finite, or economically inadmissible parameterizations.
- Every generated table or figure must be reproducible from one documented command.

## Figure-production standards

- Save publication figures in vector PDF when possible and PNG only for previews.
- Crop internal whitespace at export rather than relying solely on LaTeX scaling.
- Store figure data and plotting parameters with each figure.
- Avoid forced `[H]` placement unless there is a demonstrated pagination need.
- Verify the compiled manuscript visually after any float or crop change.

## Local and cloud environments

The Windows folders mentioned by Enrique are not automatically visible in a cloud Codex session. Import legacy files into this branch through a deliberate, reviewed commit. Do not claim those files were inspected unless they were actually copied into the working tree or attached to the task.

For local work, the expected clone is:

```text
C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter
```

Before beginning a task, run `git status`, `git branch --show-current`, and `git pull --ff-only`. Before ending, run the relevant tests, update the project log, commit, and push.
