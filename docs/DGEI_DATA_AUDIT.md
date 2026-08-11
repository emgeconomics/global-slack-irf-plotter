# DGEI Data Audit for the SMM Exercise

## Audit date and vintage

**Audit date:** 2026-08-11  
**Workbook headers:** Last updated August 2026  
**Aggregation sheet:** `US Trade Weights`  
**Country mapping:** Home = United States; Foreign = World excluding the United States.

The audit uses the three official Dallas Fed DGEI workbooks registered in `smm/config/sources.csv`.

## Exact workbook blocks

| Observable | Workbook | Frequency | Range | Unit/block | ROW label | U.S. label |
|---|---|---:|---|---|---|---|
| Real GDP | `dgei_gdp.xlsx` | Quarterly | `G8:K194` | Index, 2005 = 100 | World (ex. U.S.) | US |
| Headline CPI | `dgei_cpi.xlsx` | Monthly | `G8:K566` | Index, 2005 = 100 | World (ex. U.S.) | US |
| Policy rate | `dgei_policy.xlsx` | Monthly | `A8:E567` | Percent per annum | World (ex. U.S.) | US |

The script validates the five expected headers exactly:

```text
Date | World (ex. U.S.) | Advanced (ex. U.S.) | Emerging | US
```

It stops rather than silently proceeding if the workbook schema changes.

## Raw coverage

| Series | First usable | Last usable | Observations |
|---|---:|---:|---:|
| ROW real GDP index | 1980Q2 | 2026Q1 | 184 |
| U.S. real GDP index | 1980Q2 | 2026Q2 | 185 |
| ROW headline CPI index | 1980-02 | 2026-06 | 557 |
| U.S. headline CPI index | 1980-02 | 2026-06 | 557 |
| ROW policy rate | 1980-01 | 2026-07 | 559 |
| U.S. policy rate | 1980-01 | 2026-07 | 559 |

There are no internal gaps after the first usable observation in any of the six selected series. The common endpoint is determined by ROW real GDP, which ends in 2026Q1 in this vintage.

## Transformations

### Real GDP growth

For quarterly index level `Y_t`, the internal SMM observable is

```text
g_y,t = 100 log(Y_t / Y_{t-1}).
```

The annualized presentation counterpart is `4 g_y,t`.

### Headline CPI inflation

The three monthly CPI index observations in each complete quarter are averaged first:

```text
P_q = (P_m1 + P_m2 + P_m3) / 3.
```

The internal quarterly inflation observable is

```text
pi_q = 100 log(P_q / P_{q-1}).
```

The annualized presentation counterpart is `4 pi_q`. Monthly inflation rates are not averaged.

### Policy rates

Monthly annual-percent policy rates are averaged within each complete quarter. The internal quarterly model unit is

```text
i_q = quarterly_average_annual_rate / 4.
```

The annual-rate quarterly average is retained for presentation and audit.

## Common transformed sample

The continuous six-variable panel runs from **1980Q3 through 2026Q1**, for **183 quarterly observations**. The one-quarter loss at the start reflects the lag required to construct GDP growth and CPI inflation.

The preferred benchmark sample is **1984Q1–2007Q4**, for **96 quarterly observations**. The full-sample stress test uses all 183 observations. The prespecified full-sample robustness excluding **2020Q2–2021Q1** contains **179 observations**.

## Generated checkpoint outside Git

A polished data-audit workbook and CSV were generated during the audit:

```text
DGEI_US_ROW_Quarterly_SMM_Panel_Aug2026.xlsx
dgei_us_row_quarterly_smm_aug2026.csv
```

The workbook contains the transformed panel, coverage audit, source manifest with SHA-256 hashes, and transformation notes. These files are not automatically committed because raw and processed-data publication should follow the repository's data-distribution decision.

## Reproduction

After downloading the three workbooks with

```powershell
Rscript smm/R/download_dgei.R
```

build the panel with

```powershell
Rscript smm/R/build_quarterly_panel.R
```

The builder writes:

```text
smm/data/processed/dgei_us_row_quarterly.csv
smm/data/manifests/dgei_panel_coverage.csv
```

The current R builder is implementation-ready but has not yet been executed in the user's local R environment. Its exact transformed coverage was independently verified against the August 2026 workbooks during this audit.
