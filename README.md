# Global Slack Web Plotter

This folder contains a static browser-based impulse-response plotter for the workhorse two-country New Keynesian model used in the Global Slack Hypothesis project.

## Files

- `index.html`: page structure and controls.
- `styles.css`: visual styling aligned with the clean Google Sites/emgeconomics layout.
- `model.js`: self-contained JavaScript implementation of the log-linearized PCP model used in the replication exercises.
- `app.js`: user-interface logic, chart rendering, and CSV/SVG downloads.
- `assets/emgeconomics-logo.png`: archived local copy of the emgeconomics logo; the current embedded plotter does not display a custom header.
- `assets/globalslackmodel_reference.mod`: reference Dynare model file used as the source for the browser implementation.

## How To Run Locally

Because the page uses JavaScript modules, open it through a local static server rather than double-clicking the HTML file. From this folder, one option is:

```powershell
python -m http.server 8788
```

Then open:

```text
http://localhost:8788
```

Do not open `index.html` by double-clicking it unless your browser allows local JavaScript modules. If the page is opened through `file://`, the controls or charts may fail to load.

## Using The Tool

1. Select the shock, sign, size, and horizon.
2. Edit the benchmark and alternative parameterizations using the side-by-side slider controls or the exact numeric boxes, including `n` and `xi`.
3. Click `Plot responses` to update the impulse-response charts.
4. Use `Reset both to paper benchmark` or `Copy benchmark to alternative` to compare one parameterization against another.
5. Download the plotted IRF data with `Download IRF data`.

The chart set includes inflation, employment, output, output growth, interest rates, natural interest rates, real exchange rates, trade balances, terms of trade, and the four exogenous shock processes. Policy rates and natural rates are plotted in separate panels. In the relative-price panels, solid lines report terms of trade and dashed lines report real exchange rates. Only the selected one-time innovation moves on impact; the other shock-process panels remain at zero unless they are mechanically affected by the selected process.

## Hosting On Google Sites

The tool is static and does not require MATLAB, Dynare, a database, or server-side computation. Google Sites does not directly host a folder of custom JavaScript files, so the clean workflow is:

1. Upload the contents of this `web` folder to a static host such as GitHub Pages, Netlify, Cloudflare Pages, or an institutional web server.
2. Confirm that the hosted `index.html` opens with an `https://` URL and that `app.js`, `model.js`, and `styles.css` load from the same folder.
3. In Google Sites, open the page where the plotter should appear.
4. Use `Insert` > `Embed` > `By URL`.
5. Paste the hosted `https://.../index.html` URL.
6. Resize the embedded frame to the full page width and a tall height, ideally at least 1200-1600 pixels so users can interact with the controls and see the chart sections.

For a direct iframe embed, use the hosted URL in this pattern:

```html
<iframe
  src="https://YOUR-HOSTED-PLOTTER-URL/index.html"
  width="100%"
  height="1600"
  style="border:0;"
  loading="lazy">
</iframe>
```

The page styling uses the same restrained Google Sites-style design language as `emgeconomics`: white background, dark text, Arvo/Lato typography, thin gray dividers, Google-blue links and action buttons, and simple card sections.

## Model Notes

The benchmark parameterization matches the U.S.-rest-of-world parameterization used in the revised replication package. The foreign import-share parameter is computed internally from the zero steady-state trade-balance restriction:

```text
xi* = n(1 - xi)/(1 - n)
```

The controls impose the home-bias restriction `xi >= n`; `xi*` is displayed but not directly selectable. The current implementation focuses on a producer-currency-pricing model. Producer-currency pricing, abbreviated PCP, means exporters set prices in their own currency, implying full exchange-rate pass-through. Shock correlations are displayed for consistency with the stochastic parameterization, but deterministic impulse responses are generated from the selected one-time innovation.

The dynamic block describes how aggregate demand, inflation, monetary policy, natural rates, potential output, productivity shocks, and monetary-policy shocks interact in the Home and Foreign economies. Employment is computed from production as `l = y - a` and `l* = y* - a*`.

The standard Taylor-rule option responds to inflation and slack without tracking the natural interest rate. The Wicksellian option adds the corresponding domestic natural rate to the policy rule. Home and Foreign natural-rate tracking can be selected independently, so one economy can use the Wicksellian rule while the other uses the standard Taylor rule. If a selected specification cannot be solved, is singular, or produces a numerically explosive/non-finite solution, the chart area displays a solution-not-available message instead of plotting IRFs.

The web text cites the companion Global Slack paper and Martinez Garcia (2019), "Good Policies or Good Luck? New Insights on Globalization and the International Monetary Policy Transmission Mechanism," DOI: <https://doi.org/10.1007/s10614-017-9746-9>.

The relative-price and external-adjustment objects are accounting closures computed after the dynamic solution. In the producer-currency-pricing environment, the Home terms of trade move with the productivity-driven natural relative price and with the gap between Home and Foreign slack. The Foreign terms of trade move one-for-one in the opposite direction. The real exchange rates are tied to those terms-of-trade movements through the difference in Home-good expenditure shares across the two consumption baskets. Because the model is normalized around zero steady-state trade balance, the trade-balance series report deviations from that steady-state benchmark: a positive Home value corresponds to an equal Foreign deficit, and vice versa.
