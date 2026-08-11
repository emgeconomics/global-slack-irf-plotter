# Reduced-Form Correction after Expanding the Shock Vector

## Why the old order statements cannot be copied

The current paper's exact no-inertia four-variable VAR(1) result relies on a square mapping from four forcing states—Home and Foreign productivity and monetary-policy shocks—to the four inflation/slack variables. After adding persistent Home and Foreign markup shocks and Home and Foreign aggregate-demand wedges, the forcing vector has eight components. The four observed inflation/slack variables no longer generically span that state.

Consequently, the revised paper must not mechanically retain:

```text
exact four-variable VAR(1) under no inertia;
exact six-variable VAR(2) under inertia;
ARMA(4,3) and ARMA(12,10) generic bounds;
ARDL-MA bounds derived from those low-dimensional VARs.
```

Those statements may survive only in special zero-variance/zero-persistence cases or after model-specific cancellations are proved numerically and analytically.

## Correct general representation

Let the forcing vector be

```text
X_t = [a_t, a*_t, m_t, m*_t, mu_t, mu*_t, zeta_t, zeta*_t]'.
```

With inertial policy, define the predetermined state

```text
s_t = [i_{t-1}, i*_{t-1}, X_t']'.
```

Under determinacy, the solved model can be written as

```text
W_t     = H s_t,
s_{t+1} = T s_t + R u_{t+1},
```

where

```text
W_t = [pi_t, pi*_t, x_t, x*_t, i_t, i*_t]'.
```

For any selected observables `Y_t = C s_t`, the adjugate identity implies

```text
det(I - T L) Y_t = C adj(I - T L) R u_t.
```

Thus, the model has a restricted finite-order VARMA representation. The existence of this representation is standard; the paper uses it as an analytical instrument to expose the model's cross-equation restrictions and the omitted dynamics in conventional Phillips-curve projections.

## Generic scalar order bounds

When all eight forcing processes are persistent and the state is minimal:

- no policy inertia: state dimension 8, giving a generic scalar ARMA(8,7) bound;
- inertial Home and Foreign policy rates: state dimension 10, giving a generic scalar ARMA(10,9) bound.

These are upper bounds. The actual order can be lower because of:

- zero-persistence shocks;
- repeated roots;
- redundant/nonminimal states;
- rank restrictions;
- exact structural cancellations.

The ARDL-MA representation retaining Home and Foreign slack also remains finite order, but its sharp order and coefficients must be computed from the final SMM parameterization rather than inferred from the old four-shock system.

## Manuscript action

Replace the current Appendix B low-dimensional VAR derivation with the state-space formulation above. Recompute all numerical ARMA/ARDL-MA tables and projection decompositions after the final SMM parameterization is fixed. The revised abstract, introduction, Section 3, and conclusion should describe the state-space/VARMA machinery as a device for characterizing restrictions, not as the paper's novelty.
