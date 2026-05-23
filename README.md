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

The chart set includes inflation, employment, output, output growth, interest rates, natural interest rates, real exchange rates, trade balances, terms of trade, and the four exogenous shock processes. Policy rates and natural rates are plotted in separate panels. In the relative-price panels, solid lines report terms of trade and dashed lines report real exchange rates. For both economies, an increase in the terms of trade is a deterioration, and an increase in the real exchange rate is a real depreciation from that economy's perspective. Only the selected one-time innovation moves on impact; the other shock-process panels remain at zero unless they are mechanically affected by the selected process.

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

This browser-based plotter accompanies *The Global Slack Hypothesis and the Open-Economy Phillips Curve* by Enrique Martinez Garcia and Mark A. Wynne, and *Good Policies or Good Luck? New Insights on Globalization and the International Monetary Policy Transmission Mechanism* by Enrique Martinez Garcia. The Dallas Fed link is a placeholder for the public version of the Global Slack paper.

The plotter solves a workhorse two-country New Keynesian model in which the Home and Foreign economies are linked through trade, relative prices, monetary policy, and cross-country shock transmission. The pricing assumption is producer-currency pricing (PCP): exporters set prices in their own currency. Under PCP, nominal exchange-rate movements pass through fully to import prices.

The benchmark parameterization matches the U.S.-rest-of-world parameterization used in the revised replication package. The Foreign import-share parameter is computed internally from the zero steady-state trade-balance restriction:

```text
xi* = n(1 - xi)/(1 - n)
```

The interface therefore allows users to choose the Home country size, `n`, and the Home import-share parameter, `xi`, but not `xi*`. The controls impose the economically natural home-bias restriction `xi >= n`.

Shock magnitudes are expressed in innovation standard deviations. In a Gaussian benchmark, one-, two-, and three-standard-deviation innovations correspond approximately to 68, 95, and 99.7 percent probability bands. The impact response is plotted as quarter 1, and the default simulation horizon is 40 quarters. Innovation correlations are retained as displayed parameters for consistency with the underlying stochastic model, but a deterministic one-shock impulse response is driven only by the selected innovation.

The model combines aggregate-demand equations, Phillips curves for inflation, monetary-policy rules, natural-rate and potential-output relationships, and stochastic processes for productivity and monetary-policy disturbances in both economies. Home and Foreign employment are computed from the log-linear production relationships:

```text
l = y - a,    l* = y* - a*
```

Policy-rate and natural-rate responses are shown in separate panels. In the relative-price panels, solid lines report the terms of trade, while dashed lines report the real exchange rate. The Wicksellian monetary-policy option means that the selected policy rule tracks its own economy's natural rate. The standard Taylor-rule option instead responds to inflation and slack without an explicit natural-rate tracking term. The Home and Foreign policy rules can be set independently. If a selected specification cannot be solved, is singular, or produces a numerically explosive/non-finite solution, the chart area displays a solution-not-available message instead of plotting IRFs.

The web text cites the companion Global Slack paper and Martinez Garcia (2019), "Good Policies or Good Luck? New Insights on Globalization and the International Monetary Policy Transmission Mechanism," DOI: <https://doi.org/10.1007/s10614-017-9746-9>.

The plotted terms of trade, real exchange rates, and trade balances are accounting relationships computed after solving the dynamic system. For each economy, the terms of trade are defined as the price of imports relative to the price of exports, with both prices expressed in units of that economy's own currency. Under this convention, an increase in the terms of trade means that imports have become more expensive relative to exports and therefore represents a deterioration; a decrease represents an improvement. In log-linear terms, the Foreign terms of trade move one-for-one in the opposite direction from the Home terms of trade.

The real exchange rate is also reported from the perspective of the economy being plotted, after expressing the relevant consumption baskets in a common currency. An increase in the Home real exchange rate corresponds to a real depreciation of the Home currency, while a decrease corresponds to a real appreciation. The Foreign real exchange rate is defined symmetrically, so its log-linear movement is the negative of the Home real exchange rate.

Because the model is normalized around zero steady-state trade balance, the plotted trade-balance series report deviations from that benchmark. A positive Home trade-balance response corresponds to an equal Foreign deficit, and vice versa.
