# Foreign Policy-Rate Measurement for the SMM Exercise

## Status

**Date:** 2026-08-11  
**Status:** Recommendation pending author approval  
**Source:** https://www.dallasfed.org/research/international/dgei

The intended quantitative mapping is Home = United States and Foreign = rest of world excluding the United States. That mapping works naturally for real GDP and headline CPI. It is not automatically appropriate for a single foreign policy-rate observable, because the U.S.-trade-weighted World (ex. U.S.) rate aggregates advanced and emerging economies with very different inflation and policy regimes.

## Audit result

The August 2026 DGEI policy-rate workbook provides both `World (ex. U.S.)` and `Advanced (ex. U.S.)` on the `US Trade Weights` sheet. After converting monthly annual-percent rates into quarterly averages and dividing by four for the model's quarterly units, the two candidates have sharply different properties.

### Pre-GFC sample: 1984Q1–2007Q4

| Statistic | World ex-U.S. | Advanced ex-U.S. |
|---|---:|---:|
| Standard deviation, quarterly percentage points | 26.957 | 0.594 |
| First-order autocorrelation | 0.339 | 0.986 |
| Correlation with U.S. policy rate | 0.182 | 0.778 |
| Minimum, annual-percent quarterly average | 3.338 | 1.716 |
| Maximum, annual-percent quarterly average | 993.837 | 9.824 |

### Full common sample: 1980Q3–2026Q1

| Statistic | World ex-U.S. | Advanced ex-U.S. |
|---|---:|---:|
| Standard deviation, quarterly percentage points | 19.771 | 0.808 |
| First-order autocorrelation | 0.358 | 0.992 |
| Correlation with U.S. policy rate | 0.157 | 0.916 |
| Minimum, annual-percent quarterly average | 1.909 | -0.006 |
| Maximum, annual-percent quarterly average | 993.837 | 12.969 |

The extreme World ex-U.S. observations are driven by emerging-market episodes. The largest quarterly annual-percent values are approximately:

| Quarter | World ex-U.S. | Advanced ex-U.S. | Emerging |
|---|---:|---:|---:|
| 1990Q1 | 993.837 | 9.478 | 5,896.750 |
| 1989Q4 | 354.780 | 9.335 | 2,181.137 |
| 1994Q2 | 173.944 | 4.609 | 623.516 |
| 1994Q1 | 120.219 | 4.292 | 427.996 |

These are valid observations in the broad aggregate, not data-processing errors. They are nevertheless a poor empirical counterpart to the single Foreign Taylor-rule rate in a stationary linear two-country model.

## Recommended benchmark

Use:

- **World (ex. U.S.)** for foreign real GDP growth;
- **World (ex. U.S.)** for foreign headline CPI inflation;
- **Advanced (ex. U.S.)** for the foreign policy-rate observable.

Retain the raw World ex-U.S. rate in the data archive and report it as a robustness/audit series. The manuscript should explain that the benchmark policy proxy is narrower because a single policy instrument cannot coherently represent the extreme nominal regimes embedded in the broad world aggregate.

This is a measurement choice, not a change in the theoretical definition of the Foreign economy. The Foreign real-activity and inflation blocks remain world ex-U.S.; the policy-rate proxy is selected to match the stationary Taylor-rule environment used for quantitative discipline.

## Alternatives considered

1. **Use the raw World ex-U.S. rate.** Rejected as the benchmark because its variance would dominate the objective and force implausible policy shocks or other compensating parameter distortions.
2. **Winsorize or truncate the World ex-U.S. rate.** Not preferred because the threshold would be arbitrary and would obscure the economic source of the problem.
3. **Use changes rather than levels.** Potentially useful as a robustness moment, but it does not resolve the mismatch between the broad nominal aggregate and the model's single policy-rule state.
4. **Drop foreign policy-rate moments.** Feasible in a reduced moment set, but it discards useful information for disciplining the Foreign policy block.
5. **Construct a model-consistent weighted shadow policy index.** Beyond the intended scope and not needed for the current revision.

## Implementation consequences

- `smm/config/series_crosswalk.csv` records both World ex-U.S. and Advanced ex-U.S. policy candidates.
- The processed quarterly panel should preserve both.
- The benchmark target-moment configuration should point `i_row` to Advanced ex-U.S.
- A robustness configuration should point `i_row` to World ex-U.S. and disclose the resulting fit failure rather than silently reweighting the problematic moments away.
- The final SMM tables must label the policy proxy explicitly; they should not call it simply “ROW policy rate” without qualification.
