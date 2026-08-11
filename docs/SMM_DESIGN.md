# Simulated Method of Moments Design

## 1. Purpose and scope

The SMM exercise is a disciplined calibration of the compact two-country model, not a full structural estimation of every primitive. The exercise holds the trade structure, preferences, country size, policy-rule coefficients, and most nominal-rigidity assumptions fixed or tightly disciplined, while using observed U.S. and rest-of-world dynamics to select:

- persistence and volatility of productivity shocks;
- persistence and volatility of monetary-policy shocks;
- persistence and volatility of markup shocks;
- persistence and volatility of aggregate-demand shocks;
- within-family cross-country innovation correlations; and
- a closed-economy-equivalent Phillips-curve slope.

The central question is whether the paper's measurement-error and reduced-form-projection results survive after the model is required to reproduce salient volatility, persistence, and comovement in inflation, real GDP growth, and policy rates.

## 2. Data source and exact downloads

Use the Federal Reserve Bank of Dallas **Database of Global Economic Indicators (DGEI)**.

Source page:

```text
https://www.dallasfed.org/research/international/dgei
```

Source workbooks:

```text
Real GDP, quarterly:
https://www.dallasfed.org/-/media/Documents/research/international/dgei/gdp.xlsx

Headline CPI, monthly:
https://www.dallasfed.org/-/media/Documents/research/international/dgei/cpi.xlsx

Short-term official/policy rates, monthly:
https://www.dallasfed.org/-/media/documents/research/international/dgei/policy.xlsx
```

For every run, save a provenance manifest containing:

- retrieval timestamp in UTC;
- source URL;
- SHA-256 checksum;
- workbook sheet and exact series labels used;
- first and last nonmissing observation;
- DGEI weighting scheme;
- transformation code commit.

Do not hand-edit downloaded workbooks. Corrections, exclusions, or splices must be implemented in code and recorded in the manifest.

## 3. Geography and aggregation

- **Home:** United States.
- **Foreign:** World excluding the United States.
- **Foreign weighting:** U.S.-trade weights.

This is the benchmark because it matches the paper's U.S.–rest-of-world interpretation and gives foreign activity the composition most relevant for U.S. exposure.

The data loader must validate the exact series names rather than selecting columns by position. It must fail if the expected geography/weighting labels are absent or duplicated.

## 4. Quarterly observable panel

The estimation vector is

```text
z_t = [g_y,t, g_y*,t, pi_t, pi*_t, i_t, i*_t]'.
```

### 4.1 Real GDP growth

From seasonally adjusted quarterly real GDP levels `Y_t`, compute

```text
g_y,t = 100 [log(Y_t) - log(Y_{t-1})].
```

Use quarterly percentage log changes internally. Multiply by four only for annualized presentation tables. Apply the same convention to model output growth.

### 4.2 Headline CPI inflation

The expected DGEI input is a monthly headline CPI level/index. For each quarter, form the arithmetic average of the three monthly CPI levels,

```text
P_q = mean(P_m in quarter q),
```

then compute

```text
pi_q = 100 [log(P_q) - log(P_{q-1})].
```

Do not average monthly inflation rates as a substitute for quarterly inflation. If the workbook contains transformations rather than index levels, stop and document the issue before proceeding; either identify the underlying index series or implement a mathematically verified reconstruction.

### 4.3 Short-term official/policy rates

From monthly rates quoted in percent per annum, compute the quarterly arithmetic average and convert to a quarterly rate for internal model matching:

```text
i_q = mean(i_m in quarter q) / 4.
```

Retain the annual-rate version for presentation. Because the model is log-linearized around a steady state, center policy rates within each estimation sample before computing moments.

### 4.4 Centering

The model describes deviations from a deterministic steady state. Do not target unconditional means in the benchmark. Within each sample, subtract the sample mean from each observable before computing covariance, autocorrelation, and cross-correlation moments. Preserve the uncentered series in the processed data file for transparency.

## 5. Samples

The exact common start date is chosen after a six-series coverage audit.

### Benchmark pre-GFC sample

Preferred sample:

```text
1984Q1–2007Q4
```

This period is close to the Great Moderation and avoids asking the linear Taylor-rule model to explain the effective lower bound and pandemic. A robustness version should begin at the earliest common quarter in 1980–1983 and also end in 2007Q4.

### Full sample

```text
earliest common quarter in the early 1980s–latest common quarter
```

The full-sample results are a robustness/stress test. Report two transparent treatments:

1. raw full-sample moments;
2. full-sample moments excluding the predeclared pandemic window 2020Q2–2021Q1.

Do not choose the exclusion window after inspecting the parameter estimates. The model's lack of an effective-lower-bound mechanism and time-varying shock volatility must be stated explicitly.

## 6. Calibrated structural parameters

The benchmark fixes or externally calibrates:

```text
beta
n, xi, and implied xi_star
sigma (trade elasticity)
gamma and varphi
Taylor-rule inertia and response coefficients
natural-rate-tracking indicators
```

The current U.S.–rest-of-world values are the starting point, not an automatic final choice. Every fixed parameter must be listed with its value, source, and sensitivity range.

The benchmark does not estimate LCP, hybrid, or DCP shares. Quantitative estimation is conducted under PCP, matching the paper's Monte Carlo data-generating process.

## 7. Estimated parameter vector

A practical benchmark permits common persistence within each shock family, country-specific innovation standard deviations, and a cross-country innovation correlation:

```text
theta = [
  rho_a,  sigma_a,H,  sigma_a,F,  corr_a,
  rho_m,  sigma_m,H,  sigma_m,F,  corr_m,
  rho_mu, sigma_mu,H, sigma_mu,F, corr_mu,
  rho_d,  sigma_d,H,  sigma_d,F,  corr_d,
  kappa_closed
]'.
```

This is a 17-parameter benchmark. If the data do not identify all four correlations or if the Jacobian is ill-conditioned, use the following prespecified reduction sequence rather than ad hoc deletion:

1. set `corr_m = 0`;
2. set `corr_mu = 0`;
3. impose equal Home and Foreign innovation standard deviations within the monetary and markup families;
4. retain separate productivity and demand volatilities because those are most directly tied to output-growth comovement.

Do not estimate separate Home and Foreign persistence parameters in the benchmark unless the 17-parameter specification passes identification diagnostics comfortably.

### Parameter bounds

Use transformed parameters so the optimizer never evaluates inadmissible values:

```text
0.00 <= rho_j <= 0.995
sigma_j,country > 0
-0.95 <= corr_j <= 0.95
kappa_closed in a prespecified empirically plausible interval
```

The exact `kappa_closed` bounds must be justified in the manuscript and frozen before the final run. Map `kappa_closed` to the admissible Calvo `alpha` root as documented in `docs/MODEL_EXTENSION.md`.

## 8. Target moments

Let all moments be computed on centered quarterly observables. The benchmark target vector contains 27 moments.

### 8.1 Marginal dynamics — 12 moments

For each of the six observables:

- standard deviation;
- first-order autocorrelation.

### 8.2 Same-variable international comovement — 3 moments

```text
corr(g_y,t, g_y*,t)
corr(pi_t, pi*_t)
corr(i_t, i*_t)
```

### 8.3 Within-country contemporaneous comovement — 6 moments

For Home and Foreign separately:

```text
corr(pi_t, g_y,t)
corr(i_t, pi_t)
corr(i_t, g_y,t)
```

### 8.4 Monetary-policy timing — 4 moments

For Home and Foreign separately:

```text
corr(i_t, pi_{t-1})
corr(i_t, g_y,t-1)
```

### 8.5 Cross-border inflation/activity content — 2 moments

```text
corr(pi_t, g_y*,t)
corr(pi*_t, g_y,t)
```

These last two moments force the model to confront the international inflation/activity linkage without requiring an observed output gap.

### Moment-set robustness

Prespecify two alternatives:

- replace contemporaneous inflation/activity correlations with lagged activity correlations;
- add second-order autocorrelations and estimate with a correspondingly larger moment covariance matrix.

The benchmark moment set must not be altered solely because a particular parameterization fits poorly.

## 9. Model observables and scaling

For a stochastic model simulation:

```text
g_y,t(model) = y_t - y_{t-1}
g_y*,t(model) = y*_t - y*_{t-1}
```

where `y` and `y*` are log deviations expressed in percentage units. Model CPI inflation and nominal rates use quarterly percentage-point units. The data pipeline must convert annualized policy-rate observations to quarterly units before matching.

A single function must define observable transformations for both data and simulations. Presentation annualization must occur only after moment matching.

## 10. SMM criterion

Let `m_T` be the data moment vector and `m_S(theta; U)` the average simulated moment vector generated with fixed random numbers `U`. The criterion is

```text
J(theta) = [m_T - m_S(theta; U)]' W [m_T - m_S(theta; U)].
```

### Simulation design

For each sample:

- simulate `S = 200` independent artificial samples with the same length as the data sample;
- use a burn-in of at least 500 quarters per artificial sample;
- use fixed, versioned common random numbers across parameter evaluations;
- use antithetic innovations when feasible;
- increase `S` to 1,000 for the final reported objective and moment table.

The exact counts may be increased after performance testing, but the final reported run must use no fewer simulations than the values above.

### Initialization

Use the model's exact linear state-space covariance or a long deterministic-seed simulation to obtain a stable initial fit. This initialization is not the reported estimator; it is a computational aid for the SMM search.

## 11. Weighting matrix and uncertainty

### First stage

Use a diagonal weighting matrix based on inverse squared block-bootstrap standard errors of each data moment. Cap extreme weights with a prespecified floor and ceiling to prevent one nearly noiseless moment from dominating.

### Second stage

Estimate the covariance matrix of the data moment vector using a stationary or moving-block bootstrap with a block length selected by a documented rule. Use a small, reported ridge adjustment before inversion if necessary.

### Parameter uncertainty

Report at least:

- a numerical Jacobian/sandwich covariance estimate;
- profile-objective intervals for `kappa_closed` and the four shock persistences;
- a limited block-bootstrap re-estimation check for the benchmark sample.

Do not report optimizer Hessian standard errors without checking that the transformed-parameter Jacobian and moment covariance are well conditioned.

## 12. Optimization protocol

1. Transform bounded parameters to an unconstrained vector.
2. Evaluate a broad Latin-hypercube or Sobol set of starting values.
3. Retain the best starts under the first-stage criterion.
4. Run a derivative-free global/local method followed by a gradient-based polish where numerically stable.
5. Re-evaluate the best candidates with a larger simulation count.
6. Run the second-stage criterion from multiple first-stage solutions.
7. Record all starts, exit codes, iterations, objective values, run time, and bound hits.

A parameter vector is not accepted merely because one optimizer reports convergence.

## 13. Identification and fit diagnostics

Every reported estimate must include:

- singular values and condition number of the numerical moment Jacobian;
- parameter correlation matrix;
- objective contributions by moment;
- parameters at or near bounds;
- dispersion of solutions across starting values;
- model-versus-data moment plot;
- shock variance decompositions for inflation, GDP growth, and policy rates;
- comparison with the current four-shock calibration.

If the model cannot separately identify demand and markup persistence, report that fact and use the prespecified reduced specification. Do not hide weak identification behind precise-looking optimizer output.

## 14. Quantitative tests relevant to the referee

The final tables must directly answer the referee's concerns:

1. **Potential versus observed output volatility:** compare standard deviations of potential-output growth, actual GDP growth, model-consistent gaps, and filtered output.
2. **Inflation variance decomposition:** show the shares attributable to productivity, monetary, markup, and demand shocks.
3. **GDP-growth variance decomposition:** show that productivity need not account for nearly all variation.
4. **Phillips-curve slope:** report the old and SMM-disciplined `kappa_closed` and implied `alpha`.
5. **Moment fit:** report data, old calibration, and SMM calibration side by side.
6. **Measurement-error result:** re-estimate the paper's true-gap and proxy-gap regressions under both calibrations.
7. **Robustness:** report pre-GFC and full-sample estimates and explicitly separate conclusions that are stable from those that are sample dependent.

## 15. File and output architecture

Proposed structure:

```text
smm/
  README.md
  config/
    benchmark_pre_gfc.yml
    full_sample.yml
  R/
    download_dgei.R
    build_quarterly_panel.R
    model_state_space.R
    simulate_model.R
    moments.R
    objective.R
    estimate.R
    diagnostics.R
  data/
    raw/          # ignored by git; checksums/manifests tracked
    processed/    # tidy panel may be tracked if licensing permits
    manifests/
  output/
    <run_id>/
      config.yml
      manifest.json
      estimates.csv
      data_moments.csv
      simulated_moments.csv
      objective_contributions.csv
      diagnostics.json
      variance_decomposition.csv
      figures/
```

Use a run identifier containing sample, UTC timestamp, short commit SHA, and seed. The final submission outputs should also have a human-readable alias such as `submission_2026-09-04`.

## 16. Reproducibility commands

After the legacy-code import determines the final language/dependency stack, expose one command for each stage:

```text
make data
make estimate-pre-gfc
make estimate-full
make monte-carlo
make figures
make test
```

On Windows, provide equivalent PowerShell wrappers. Each command must update a run manifest and fail on missing inputs, stale generated outputs, or failed tests.
