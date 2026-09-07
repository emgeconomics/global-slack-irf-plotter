# Euler/Aggregate-Demand Wedge Normalization

## Decision

The round-two extension uses Home and Foreign Euler wedges,
`zeta_t` and `zeta*_t`, measured in real-rate-equivalent units. The internal
JavaScript state names `d` and `dstar` are retained solely for backward
compatibility with the existing interface and tests.

The wedges enter the primitive country Euler equations before the
open-economy market-clearing map is applied. The resulting output-gap block is

```text
x_t = E_t x_{t+1}
      - (1/gamma) [Lambda_x,i (r^g_t - zeta_t)
                   - Lambda_x,i* (r^{g*}_t - zeta*_t)],

x*_t = E_t x*_{t+1}
       - (1/gamma) [-Lambda_x*,i (r^g_t - zeta_t)
                    + Lambda_x*,i* (r^{g*}_t - zeta*_t)].
```

This is preferred to adding `+ d_t` and `+ d*_t` mechanically to the two final
IS equations in output-gap units.

## Why gamma appears

`gamma` is not a free loading attached only to the new shocks. It is the common
CRRA curvature and inverse intertemporal elasticity of substitution in both
countries. In the existing model it already enters:

- the Home and Foreign Euler equations;
- complete-markets risk sharing;
- the terms-of-trade denominator and real-exchange-rate mapping;
- the Phillips-curve composite coefficients;
- frictionless consumption and potential-output coefficients;
- the natural-rate formulas.

Because the numerical system multiplies the IS equations through by `gamma`,
the wedge coefficients in the stacked linear system are the relevant entries
of the open-economy `Lambda_x` matrix. They are not separate `gamma*d` and
`gamma*dstar` terms.

## Why the same gamma is used in both countries

The baseline model assumes the same CRRA curvature for Home and Foreign
households. Using the same `gamma` is therefore internally consistent. Separate
`gamma_H` and `gamma_F` values would not be a local robustness toggle: they
would change risk sharing and every composite coefficient derived from it.
Such an asymmetric-preferences extension would require a full re-derivation and
would add weakly identified parameters to an already limited-moment exercise.
It is not part of the benchmark round-two response.

Home and Foreign demand shocks can nevertheless differ in persistence,
innovation volatility, and their bilateral innovation correlation.

## Preference-shock interpretation

A time-varying preference or discount-factor shifter can motivate an Euler
wedge. For example, if marginal utility is multiplied by `exp(chi_t)`, the
log-linear Euler equation contains a term proportional to

```text
zeta^chi_t = chi_t - E_t chi_{t+1}.
```

A literal primitive preference shock generally also changes the flexible-price
consumption path and hence the natural rate. The benchmark extension instead
holds the existing productivity-driven frictionless allocation fixed and treats
`zeta_t` as an inefficient or residual wedge relative to that benchmark. It can
summarize risk premia, credit spreads, borrowing constraints, financial
conditions, fiscal-demand shifts not separately modeled, or other desired-
expenditure disturbances.

The manuscript should therefore say that a preference shifter is **one possible
microfoundation**, not that the wedge is uniquely a preference shock.

## Coding map

In `model/system.js`, the Home equation receives loadings

```text
+ Lambda_x,i  * d
- Lambda_x,i* * dstar
```

and the Foreign equation receives

```text
- Lambda_x*,i  * d
+ Lambda_x*,i* * dstar.
```

This ensures that each country-specific Euler wedge can propagate through both
rows of the open-economy aggregate-demand system. Automated tests verify the
impact sign, cross-country propagation, AR(1) law, and exact nesting when the
new innovation variances are zero.
