# Notation Crosswalk for the Round-2 Extension

## Purpose

The current online appendix already uses \(\widehat d_t\) and \(\widehat d_t^\ast\) for deviations from the law of one price. The aggregate-demand shocks added for the round-2 revision must therefore use different manuscript notation.

## Manuscript-facing notation

| Economic object | Home | Foreign |
|---|---|---|
| Productivity | \(\widehat a_t\) | \(\widehat a_t^\ast\) |
| Monetary-policy disturbance | \(\widehat\varepsilon_t^m\) | \(\widehat\varepsilon_t^{m\ast}\) |
| Producer-origin markup/cost-push wedge | \(\widehat\mu_t\) | \(\widehat\mu_t^\ast\) |
| Aggregate-demand/IS wedge | \(\widehat\zeta_t\) | \(\widehat\zeta_t^\ast\) |
| Home-good LOP deviation | \(\widehat d_t\) | not applicable |
| Foreign-good LOP deviation | not applicable | \(\widehat d_t^\ast\) |

The aggregate-demand block should therefore be written as

```text
x_hat_t = E_t x_hat_{t+1}
          - (1/gamma)[Lambda_x,i r_hat^g_t
                       - Lambda_x,i* r_hat^{g*}_t]
          + zeta_hat_t,

x_hat*_t = E_t x_hat*_{t+1}
           - (1/gamma)[-Lambda_x*,i r_hat^g_t
                        + Lambda_x*,i* r_hat^{g*}_t]
           + zeta_hat*_t.
```

## Code-facing notation

The JavaScript implementation currently uses the compact state names:

```text
mu, mustar, d, dstar
```

where `d` and `dstar` are the aggregate-demand wedges. This internal naming is retained to avoid unnecessary code churn. Every publication table, equation, downloadable metadata file, and manuscript-facing output must map:

```text
d     -> zeta_hat_t
dstar -> zeta_hat*_t
```

The code variables must never be confused with the online appendix's law-of-one-price variables \(\widehat d_t\) and \(\widehat d_t^\ast\).

## Interpretation discipline

- \(\widehat\mu_t\) and \(\widehat\mu_t^\ast\) are inefficient cost-push/desired-reset-price wedges relative to the unchanged efficient flexible-price benchmark. Calling them time-varying efficient markups would require re-deriving potential output and natural rates.
- \(\widehat\zeta_t\) and \(\widehat\zeta_t^\ast\) are reduced-form aggregate-demand wedges. They may summarize preference, risk-premium, fiscal, or financial-condition shifts, but they are not labeled primitive preference shocks unless the household Euler equations and natural-rate block are re-derived accordingly.
