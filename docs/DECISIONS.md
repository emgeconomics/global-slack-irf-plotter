# Project Decisions

This file records adopted decisions that affect the model, data, estimation, manuscript, or replication package. Superseded decisions remain in the file and are marked accordingly.

## D-001 — Revision workspace

**Date:** 2026-08-11  
**Status:** Adopted  
**Decision:** Use branch `codex/lajcb-r2-smm` as the development workspace for the second-round LACB revision. Keep `main` unchanged until explicit approval to merge.

**Rationale:** The current `main` branch is a compact static IRF plotter. The revision requires model, data, estimation, testing, and publication-output work that should be reviewed as a coherent change set.

## D-002 — Public-repository boundary

**Date:** 2026-08-11  
**Status:** Adopted  
**Decision:** Do not commit confidential referee correspondence, private email, unpublished manuscript source, credentials, or restricted files to this public repository without explicit approval.

**Rationale:** The repository is public. The quantitative code and nonconfidential design documentation can be developed here without exposing sensitive material.

## D-003 — Markup-shock architecture

**Date:** 2026-08-11  
**Status:** Adopted for implementation  
**Decision:** Add one producer-origin markup shock for Home producers and one for Foreign producers. Each shock enters every price-setting block of the corresponding producer origin. In CPI Phillips curves, origin shocks are aggregated with the consumption-basket weights.

The benchmark PCP equations are

```text
pi_t = beta E_t pi_{t+1}
       + Phi[Psi_pi,x x_t + Psi_pi,x* x*_t
             + xi mu_t + (1-xi) mu*_t],

pi*_t = beta E_t pi*_{t+1}
        + Phi[Psi_pi*,x x_t + Psi_pi*,x* x*_t
              + xi* mu_t + (1-xi*) mu*_t].
```

The shock laws are

```text
mu_t  = rho_mu  mu_{t-1}  + sigma_mu  eps_mu,t,
mu*_t = rho_mu* mu*_{t-1} + sigma_mu* eps_mu*,t.
```

**Sign convention:** A positive markup innovation raises desired markups/cost pressure and therefore inflation, holding gaps and expectations fixed.

**Rationale:** This supplies inflation variation independent of productivity and monetary-policy shocks while preserving a transparent mapping across PCP, LCP, hybrid, and DCP pricing blocks.

## D-004 — Aggregate-demand shock architecture

**Date:** 2026-08-11  
**Status:** Adopted for implementation  
**Decision:** Add country-specific reduced-form IS wedges in output-gap units:

```text
x_t = E_t x_{t+1}
      - (1/gamma)[Lambda_x,i r^g_t - Lambda_x,i* r^{g*}_t]
      + d_t,

x*_t = E_t x*_{t+1}
       - (1/gamma)[-Lambda_x*,i r^g_t + Lambda_x*,i* r^{g*}_t]
       + d*_t.
```

with AR(1) laws for `d_t` and `d*_t`.

**Rationale:** The wedges add parsimonious demand-side variation without claiming a unique primitive interpretation. They may summarize preference, risk-premium, fiscal, or other desired-expenditure shifts.

## D-005 — Frictionless benchmark

**Date:** 2026-08-11  
**Status:** Adopted  
**Decision:** In the benchmark extension, markup and aggregate-demand wedges do not alter potential output, frictionless terms of trade, or natural real rates. Those objects remain functions of productivity as in the current derivation.

**Rationale:** The new shocks are treated as inefficient wedges around the existing efficient flexible-price allocation. This limits the required changes and keeps the paper's output-gap definition intact.

## D-006 — DGEI country mapping and weighting

**Date:** 2026-08-11  
**Status:** Adopted  
**Decision:** Map Home to the United States and Foreign to the DGEI rest-of-world-excluding-U.S. aggregate using U.S.-trade weights. Use headline CPI rather than core CPI in the benchmark quantitative exercise.

**Rationale:** This mapping corresponds directly to the paper's U.S.–rest-of-world interpretation, provides a consistent source for activity, inflation, and policy-rate data, and showcases the DGEI.

## D-007 — Estimation scope

**Date:** 2026-08-11  
**Status:** Adopted in principle; final parameter list pending data audit  
**Decision:** Use simulated method of moments to discipline a limited set of shock-process parameters and one Phillips-curve-slope object, conditional on calibrated trade, preference, policy-rule, country-size, and openness parameters.

**Rationale:** This directly addresses the referee's request without turning the paper into a full-information structural-estimation exercise.

## D-008 — Samples

**Date:** 2026-08-11  
**Status:** Provisional  
**Decision:** Report a pre-GFC exercise ending in 2007Q4 and a full available sample beginning in the early 1980s. The exact common starting quarter will be selected after auditing availability and transformations for all six observables.

**Rationale:** The pre-GFC sample is closer to the Taylor-rule environment assumed by the model; the full sample tests robustness but requires explicit treatment of the effective lower bound, the pandemic, and changing inflation volatility.

## D-009 — Phillips-curve slope discipline

**Date:** 2026-08-11  
**Status:** Provisional  
**Decision:** Treat the closed-economy-equivalent slope

```text
kappa_closed = Phi * (gamma + varphi)
```

as the object to be disciplined, rather than changing several curvature parameters independently. Conditional on `beta`, `gamma`, and `varphi`, map an admissible `kappa_closed` back to the Calvo parameter `alpha` when producing the structural parameterization.

**Rationale:** The current calibration's steep Phillips curve is a central referee concern. Targeting the composite slope is more transparent and better identified by inflation/activity moments than freely estimating all of its primitive components.
