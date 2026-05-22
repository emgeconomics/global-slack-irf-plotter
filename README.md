# Global Slack IRF Plotter

Static browser-based impulse-response plotter for the workhorse two-country New Keynesian model used in the Global Slack Hypothesis project.

This tool accompanies *The Global Slack Hypothesis and the Open-Economy Phillips Curve* by Enrique Martínez García and Mark A. Wynne. It is designed to be hosted through GitHub Pages and embedded in the emgeconomics Google Sites page.

## Files

- `index.html`: page structure and controls.
- `styles.css`: visual styling aligned with the emgeconomics site.
- `model.js`: self-contained JavaScript implementation of the log-linearized producer-currency-pricing model.
- `app.js`: user-interface logic, chart rendering, and CSV/SVG downloads.
- `.nojekyll`: disables Jekyll processing on GitHub Pages.

## Model Notes

The benchmark parameterization matches the U.S.-rest-of-world parameterization used in the revised replication package. The foreign import-share parameter is computed internally from the zero steady-state trade-balance restriction:

```text
xi* = n(1 - xi)/(1 - n)
```

The controls impose the home-bias restriction `xi >= n`; `xi*` is displayed but not directly selectable. The current implementation focuses on a producer-currency-pricing model. Producer-currency pricing means exporters set prices in their own currency, implying full exchange-rate pass-through.

Policy rates and natural rates are plotted in separate panels. In the relative-price panels, solid lines report terms of trade and dashed lines report real exchange rates. The tool is static and does not require MATLAB, Dynare, a database, or server-side computation.

## GitHub Pages

Enable GitHub Pages from the repository `main` branch and root folder. The expected URL is:

```text
https://emgeconomics.github.io/global-slack-irf-plotter/
```

In Google Sites, use `Insert > Embed > By URL` and paste the GitHub Pages URL.