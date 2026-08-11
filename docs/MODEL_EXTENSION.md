# Model Extension: Markup and Aggregate-Demand Shocks

## 1. Purpose

The current quantitative model has two stochastic disturbances per country: productivity and monetary-policy shocks. The revision adds a supply-side markup shock and a demand-side IS wedge in each country. The purpose is not to change the analytical global-slack mechanism. It is to give the compact model enough independent variation to match observed inflation, output-growth, and policy-rate dynamics without forcing persistent productivity shocks to explain nearly all movement in potential output.

The extension preserves:

- the two-country structure;
- complete international asset markets;
- the zero-inflation, zero-steady-state-trade-balance expansion point;
- the efficient frictionless allocation used to define potential output and natural rates;
- the PCP benchmark and the existing LCP/hybrid/DCP relative-price architecture;
- the current definitions of Home and Foreign output gaps.

## 2. Baseline notation

Let

```text
x_t, x*_t            Home and Foreign output gaps
pi_t, pi*_t          Home and Foreign CPI inflation
r^g_t, r^{g*}_t      ex ante real-rate gaps
Phi                  Calvo slope factor
Psi_pi               2 x 2 open-economy Phillips-curve slope matrix
Lambda_x             2 x 2 open-economy IS matrix
```

where

```text
Phi = (1-alpha)(1-beta alpha)/alpha.
```

The current PCP aggregate-supply block is

```text
[pi_t ]   = beta E_t [pi_{t+1} ] + Phi Psi_pi [x_t ],
[pi*_t]              [pi*_{t+1}]              [x*_t]
```

and the current aggregate-demand block is

```text
[x_t ]   = E_t [x_{t+1} ] - (1/gamma) Lambda_x [r^g_t   ].
[x*_t]         [x*_{t+1}]                        [r^{g*}_t]
```

The signs embedded in `Lambda_x` are those used in the manuscript and current JavaScript implementation.

### Manuscript and code notation

The online appendix already uses `d_t` and `d*_t` for law-of-one-price deviations. The paper must therefore denote the new aggregate-demand wedges by `zeta_t` and `zeta*_t`. The JavaScript state names `d` and `dstar` are internal implementation names only and map to the manuscript objects `zeta_t` and `zeta*_t`. See `docs/NOTATION_CROSSWALK.md`.

## 3. Producer-origin markup shocks

### 3.1 Primitive interpretation

Let `mu_t` be the Home-producer markup/cost-push wedge and `mu*_t` the Foreign-producer wedge. They can be introduced in either of two equivalent first-order ways:

1. as a disturbance to the desired reset-price markup in the Calvo first-order condition; or
2. as an additive wedge in the producer-origin real marginal-cost gap driving the block-level Phillips curve.

For implementation and exposition, use the second representation. It is transparent and leaves the deterministic steady state unchanged because both shocks have mean zero.

The maintained potential-output and natural-rate formulas describe the efficient frictionless allocation. Therefore, `mu_t` and `mu*_t` must be described as inefficient cost-push/desired-reset-price wedges relative to that benchmark. A literal time-varying flexible-price markup would generally move flexible-price output and would require distinguishing efficient output from the distorted flexible-price allocation. That larger re-derivation is not part of the benchmark extension.

### 3.2 Block-level Calvo equations under PCP

Under PCP, a Home producer uses one producer-currency price for domestic and export sales. Its block-level inflation equation becomes

```text
pi^H_t = beta E_t pi^H_{t+1}
         + Phi[(mc_t - p^H_t) + mu_t].
```

A Foreign producer's equation becomes

```text
pi^{F*}_t = beta E_t pi^{F*}_{t+1}
            + Phi[(mc*_t - p^{F*}_t) + mu*_t].
```

The same origin shock enters every market-specific price block of that producer under alternative currency-pricing regimes. The currency of price setting changes the relevant law-of-one-price wedge, not the producer origin of the markup shock.

### 3.3 CPI aggregation under PCP

Home CPI inflation is

```text
pi_t = xi pi^H_t + (1-xi) pi^F_t.
```

Under PCP, `pi^F_t` is the Home-currency inflation rate of Foreign goods and inherits `mu*_t`. Hence

```text
pi_t = beta E_t pi_{t+1}
       + Phi[Psi_pi,x x_t + Psi_pi,x* x*_t
             + xi mu_t + (1-xi) mu*_t].              (AS-H)
```

Foreign CPI inflation is

```text
pi*_t = beta E_t pi*_{t+1}
        + Phi[Psi_pi*,x x_t + Psi_pi*,x* x*_t
              + xi* mu_t + (1-xi*) mu*_t].           (AS-F)
```

In matrix form, define

```text
mu_vec_t = [mu_t, mu*_t]'
B_mu = [[xi,      1-xi     ],
        [xi_star, 1-xi_star]].
```

Then

```text
pi_vec_t = beta E_t pi_vec_{t+1}
           + Phi Psi_pi x_vec_t
           + Phi B_mu mu_vec_t.                      (AS)
```

### 3.4 Shock processes

Use stationary AR(1) processes:

```text
mu_t  = rho_mu  mu_{t-1}  + sigma_mu  eps_mu,t,
mu*_t = rho_mu* mu*_{t-1} + sigma_mu* eps_mu*,t,
```

with standardized innovations satisfying

```text
E eps_mu,t = E eps_mu*,t = 0,
Var(eps_mu,t) = Var(eps_mu*,t) = 1,
Corr(eps_mu,t, eps_mu*,t) = rho_eps_mu.
```

Markup innovations are orthogonal to the other shock families in the benchmark. Cross-family correlation can be explored only as an explicitly labeled robustness exercise.

### 3.5 Alternative pricing regimes

The benchmark extension to LCP, hybrid PCP/LCP, and Home-currency DCP follows a simple rule:

- retain the existing model-implied law-of-one-price terms;
- add `mu_t` to every Home-producer price block;
- add `mu*_t` to every Foreign-producer price block;
- aggregate the market-specific blocks into CPI inflation with the same destination consumption weights.

Thus, the Home CPI equations become schematically

```text
LCP:
pi_t = beta E_t pi_{t+1}
       + Phi[Psi_pi,x x_t + Psi_pi,x* x*_t
             + K_pi,d d_t^LOP + K_pi,d* d_t^{LOP*}
             + xi mu_t + (1-xi) mu*_t].

Hybrid:
pi_t = beta E_t pi_{t+1}
       + Phi[Psi_pi,x x_t + Psi_pi,x* x*_t
             + epsilon_H K_pi,d d_t^LOP
             + epsilon_F K_pi,d* d_t^{LOP*}
             + xi mu_t + (1-xi) mu*_t].

Home-currency DCP:
pi_t = beta E_t pi_{t+1}
       + Phi[Psi_pi,x x_t + Psi_pi,x* x*_t
             + K_pi,d*^{DCP} d_t^{LOP*}
             + xi mu_t + (1-xi) mu*_t].
```

The exact Foreign equations must be written symmetrically in the online appendix. No assumption that the two law-of-one-price deviations are negatives of each other should be introduced unless it is already implied by the maintained relative-price closure.

## 4. Aggregate-demand/IS wedges

### 4.1 Reduced-form extension

Let `zeta_t` and `zeta*_t` be Home and Foreign desired-expenditure wedges measured in output-gap units. The extended IS block is

```text
x_t = E_t x_{t+1}
      - (1/gamma)[Lambda_x,i r^g_t - Lambda_x,i* r^{g*}_t]
      + zeta_t,                                       (AD-H)

x*_t = E_t x*_{t+1}
       - (1/gamma)[-Lambda_x*,i r^g_t
                    + Lambda_x*,i* r^{g*}_t]
       + zeta*_t.                                     (AD-F)
```

In matrix form,

```text
x_vec_t = E_t x_vec_{t+1}
          - (1/gamma) Lambda_x r_gap_vec_t
          + zeta_vec_t.                               (AD)
```

### 4.2 Interpretation

The demand wedges are intentionally reduced form. They may summarize shifts in preferences, risk premia, fiscal demand, financial conditions, or other desired-expenditure components omitted from the compact model. The manuscript should call them **aggregate-demand shocks** or **IS wedges**. It should not claim a unique preference-shock microfoundation.

A fully microfounded discount-factor/preference disturbance would generally enter the Euler equation through expected changes in marginal utility and could also alter the natural-rate benchmark. That is a distinct extension and is not the benchmark adopted here.

### 4.3 Shock processes

```text
zeta_t  = rho_zeta  zeta_{t-1}  + sigma_zeta  eps_zeta,t,
zeta*_t = rho_zeta* zeta*_{t-1} + sigma_zeta* eps_zeta*,t,
```

with standardized innovations and a within-family cross-country correlation `rho_eps_zeta`.

The benchmark assumes orthogonality across productivity, monetary-policy, markup, and demand shock families.

## 5. Frictionless allocation and natural rates

The benchmark keeps the existing efficient frictionless block unchanged:

```text
ybar_t  = Lambda_y,a a_t + Lambda_y,a* a*_t,
ybar*_t = Lambda_y*,a a_t + Lambda_y*,a* a*_t,
```

and

```text
rbar_t  = gamma[Lambda_c,a E_t Delta a_{t+1}
                + Lambda_c,a* E_t Delta a*_{t+1}],

rbar*_t = gamma[Lambda_c*,a E_t Delta a_{t+1}
                + Lambda_c*,a* E_t Delta a*_{t+1}].
```

Markup and demand shocks therefore move actual inflation/output gaps but not efficient potential output or natural rates. This convention is essential for interpreting the new shocks as inefficient wedges and for retaining the current model-consistent output-gap definition.

## 6. Monetary-policy block

The Taylor rules retain their current form:

```text
i_t = rho_i i_{t-1}
      + (1-rho_i)[iota_r,t + phi_pi pi_t + phi_x x_t]
      + m_t,

i*_t = rho_i* i*_{t-1}
       + (1-rho_i*)[iota_r*,t + phi_pi* pi*_t + phi_x* x*_t]
       + m*_t.
```

The Wicksellian option continues to use the model's natural rate as the moving benchmark. The standard Taylor-rule option uses the constant benchmark. The new demand and markup shocks influence policy endogenously through inflation and output gaps.

## 7. Expanded forcing and state vectors

The manuscript-facing forcing vector is

```text
X_t = [a_t, a*_t, m_t, m*_t, mu_t, mu*_t, zeta_t, zeta*_t]'.
```

Its transition matrix is diagonal in the benchmark:

```text
A_X = diag(rho_a, rho_a*, rho_m, rho_m*,
           rho_mu, rho_mu*, rho_zeta, rho_zeta*).
```

The innovation-loading matrix `B_X` must reproduce four 2 x 2 within-family covariance blocks and zero cross-family covariance blocks.

With inertial policy, a convenient minimal predetermined state is

```text
s_t = [i_{t-1}, i*_{t-1}, X_t']'.
```

The simulation/SMM implementation must expose a state-space representation that supports unconditional moments and long stochastic simulations in addition to deterministic IRFs.

## 8. Correct reduced-form implications

The old exact four-variable VAR(1) result relied on a square, invertible mapping between four forcing states and the four inflation-slack observables. Once persistent markup and demand shocks enlarge the forcing vector, the four-variable observable vector no longer generically spans the state. The old VAR(1), VAR(2), ARMA(4,3), ARMA(12,10), and associated ARDL-MA order bounds cannot therefore be copied mechanically into the revised paper.

Under determinacy, write the solved model as

```text
W_t     = H s_t,
s_{t+1} = T s_t + R u_{t+1},
```

where `W_t = [pi_t, pi*_t, x_t, x*_t, i_t, i*_t]'`. For any selected observable vector `Y_t = C s_t`, the adjugate identity gives

```text
det(I - T L) Y_t = C adj(I - T L) R u_t.
```

Thus, the model still implies a restricted finite-order VARMA representation, but the generic order is governed by the **minimal state dimension**, not merely by the number of observed endogenous variables.

- With eight persistent forcing states and no policy inertia, the generic scalar bound is ARMA(8,7).
- With the two lagged policy-rate states added, the generic scalar bound is ARMA(10,9).
- Zero-persistence shocks, repeated roots, nonminimal state components, rank restrictions, and model-specific cancellations may reduce the actual order.

An ARDL-MA representation that retains Home and Foreign slack also exists after the remaining states are eliminated. Its exact lag orders and coefficients must be computed at the final SMM parameterization rather than assumed from the four-shock benchmark.

This correction reinforces the intended contribution statement: the existence of a state-space/VARMA representation is standard and is not itself the paper's novelty. It is an analytical instrument for exposing the cross-equation restrictions of the open-economy model and the omitted dynamics in conventional single-equation Phillips curves.

## 9. Phillips-curve slope

The closed-economy-equivalent slope is

```text
kappa_closed = Phi(gamma + varphi).
```

The open-economy coefficients continue to satisfy

```text
Psi_pi,x + Psi_pi,x* = gamma + varphi,
```

so the sum of the Home CPI loadings on Home and Foreign slack is `kappa_closed` after multiplication by `Phi`.

For a target `kappa_closed`, define

```text
q = kappa_closed / (gamma + varphi).
```

The Calvo parameter solves

```text
q alpha = (1-alpha)(1-beta alpha),
```

or

```text
beta alpha^2 - (1 + beta + q) alpha + 1 = 0.
```

Select the economically admissible root in `(0,1)`. This mapping permits the SMM routine to work with an interpretable slope parameter while reporting the implied `alpha`.

## 10. Required implementation tests

1. **Backward compatibility:** Setting `sigma_mu = sigma_mu* = sigma_zeta = sigma_zeta* = 0` reproduces the current four-shock model to numerical tolerance.
2. **Persistence:** A unit innovation to each added AR(1) process follows the configured decay rate when other channels are disabled.
3. **Markup sign:** A positive Home markup innovation raises Home producer-price pressure on impact; CPI effects respect `xi` and `xi*` weights.
4. **Demand sign:** A positive Home demand innovation raises the Home output gap on impact under a stable benchmark.
5. **Symmetry:** Under equal country size, mirror-image baskets, and symmetric parameters, Home and Foreign impulse responses map into each other after relabeling.
6. **Accounting:** Terms of trade, real exchange rates, and trade balances retain their current sign and adding-up identities under PCP.
7. **Admissible slope:** The `kappa_closed` to `alpha` mapping returns the root in `(0,1)` and reconstructs the requested slope.
8. **Finite solution:** Every benchmark shock returns finite, nonexplosive responses for the documented horizon.
9. **State-space equivalence:** The exact state-space simulator and the validated IRF-convolution simulator produce the same impulse responses and moments to the prespecified tolerance.
10. **Reproducibility:** Stochastic simulations and SMM objectives are identical under the same seed, parameter vector, data vintage, and commit.
