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

## 3. Producer-origin markup shocks

### 3.1 Primitive interpretation

Let `mu_t` be the Home-producer markup/cost-push wedge and `mu*_t` the Foreign-producer wedge. They can be introduced in either of two equivalent first-order ways:

1. as a disturbance to the desired flexible markup in the Calvo reset-price condition; or
2. as an additive wedge in the producer-origin real marginal-cost gap driving the block-level Phillips curve.

For implementation and exposition, use the second representation. It is transparent and leaves the deterministic steady state unchanged because both shocks have mean zero.

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

Let `d_t` and `d*_t` be Home and Foreign desired-expenditure wedges measured in output-gap units. The extended IS block is

```text
x_t = E_t x_{t+1}
      - (1/gamma)[Lambda_x,i r^g_t - Lambda_x,i* r^{g*}_t]
      + d_t,                                          (AD-H)

x*_t = E_t x*_{t+1}
       - (1/gamma)[-Lambda_x*,i r^g_t
                    + Lambda_x*,i* r^{g*}_t]
       + d*_t.                                        (AD-F)
```

In matrix form,

```text
x_vec_t = E_t x_vec_{t+1}
          - (1/gamma) Lambda_x r_gap_vec_t
          + d_vec_t.                                  (AD)
```

### 4.2 Interpretation

The demand wedges are intentionally reduced form. They may summarize shifts in preferences, risk premia, fiscal demand, financial conditions, or other desired-expenditure components omitted from the compact model. The manuscript should call them **aggregate-demand shocks** or **IS wedges**. It should not claim a unique preference-shock microfoundation.

A fully microfounded discount-factor/preference disturbance would generally enter the Euler equation through expected changes in marginal utility and could also alter the natural-rate benchmark. That is a distinct extension and is not the benchmark adopted here.

### 4.3 Shock processes

```text
d_t  = rho_d  d_{t-1}  + sigma_d  eps_d,t,
d*_t = rho_d* d*_{t-1} + sigma_d* eps_d*,t,
```

with standardized innovations and a within-family cross-country correlation `rho_eps_d`.

The benchmark assumes orthogonality across productivity, monetary-policy, markup, and demand shock families.

## 5. Frictionless allocation and natural rates

The benchmark keeps the existing frictionless block unchanged:

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

Markup and demand shocks therefore move actual inflation/output gaps but not potential output or natural rates. This convention is essential for interpreting the new shocks as inefficient wedges and for retaining the current model-consistent output-gap definition.

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

## 7. Expanded state and forcing vectors

A convenient forcing vector is

```text
X_t = [a_t, a*_t, m_t, m*_t, mu_t, mu*_t, d_t, d*_t]'.
```

Its transition matrix is diagonal in the benchmark:

```text
A_X = diag(rho_a, rho_a*, rho_m, rho_m*,
           rho_mu, rho_mu*, rho_d, rho_d*).
```

The innovation-loading matrix `B_X` must reproduce four 2 x 2 within-family covariance blocks and zero cross-family covariance blocks.

The current endogenous vector used by the browser's finite-horizon solver must be expanded to carry the four added exogenous processes. The simulation/SMM implementation should expose a state-space representation that supports unconditional moments and long stochastic simulations in addition to deterministic IRFs.

## 8. Reduced-form implications

Adding forcing processes does not change the dimension of the endogenous inflation-gap-policy vector, so determinant-based maximum AR and MA orders associated with eliminating endogenous variables need not increase. What changes is:

- the innovation vector has eight rather than four structural disturbances;
- the reduced-form innovation covariance is less likely to be singular;
- inflation and output-gap dynamics can be matched without attributing most potential-output variation to TFP;
- the exact numerical ARDL–MA coefficients and projection wedges change.

The manuscript should recalculate, not merely assume, all benchmark coefficient tables after the extension.

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

1. **Backward compatibility:** Setting `sigma_mu = sigma_mu* = sigma_d = sigma_d* = 0` reproduces the current four-shock model to numerical tolerance.
2. **Persistence:** A unit innovation to each added AR(1) process follows the configured decay rate when other channels are disabled.
3. **Markup sign:** A positive Home markup innovation raises Home producer-price pressure on impact; CPI effects respect `xi` and `xi*` weights.
4. **Demand sign:** A positive Home demand innovation raises the Home output gap on impact under a stable benchmark.
5. **Symmetry:** Under equal country size, mirror-image baskets, and symmetric parameters, Home and Foreign impulse responses map into each other after relabeling.
6. **Accounting:** Terms of trade, real exchange rates, and trade balances retain their current sign and adding-up identities under PCP.
7. **Admissible slope:** The `kappa_closed` to `alpha` mapping returns the root in `(0,1)` and reconstructs the requested slope.
8. **Finite solution:** Every benchmark shock returns finite, nonexplosive responses for the documented horizon.
9. **Reproducibility:** Stochastic simulations and SMM objectives are identical under the same seed, parameter vector, data vintage, and commit.
