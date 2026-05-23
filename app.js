import {
  PAPER_PARAMS,
  PARAM_GROUPS,
  SERIES,
  cloneParams,
  getXistar,
  validateParams,
  solveModel
} from "./model.js";

const dom = {
  shockType: document.getElementById("shockType"),
  shockSign: document.getElementById("shockSign"),
  shockScale: document.getElementById("shockScale"),
  horizon: document.getElementById("horizon"),
  plotButton: document.getElementById("plotButton"),
  resetBoth: document.getElementById("resetBoth"),
  copyBenchmark: document.getElementById("copyBenchmark"),
  parameterControls: document.getElementById("parameterControls"),
  status: document.getElementById("status"),
  charts: document.getElementById("charts"),
  downloadCsv: document.getElementById("downloadCsv")
};

const HOME_BIAS_MARGIN = 0.0001;
const CHART_GROUPS = [
  ["home", "Home Economy"],
  ["foreign", "Foreign Economy"],
  ["shock", "Shock Processes"]
];
const CHART_LAYOUTS = {
  home: [["pi", "employment"], ["y", "growth"], ["i", "in"], ["tb", "tot"]],
  foreign: [["pistar", "employmentStar"], ["ystar", "growthStar"], ["istar", "instar"], ["tbstar", "totstar"]],
  shock: [["a", "astar"], ["m", "mstar"]]
};

let benchmark = cloneParams(PAPER_PARAMS);
let alternative = cloneParams(PAPER_PARAMS);
let latest = null;

function formatNumber(value, digits = 3) {
  if (!Number.isFinite(value)) return "n/a";
  const rounded = Number(value.toFixed(digits));
  return rounded.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function formatSigned(value, digits = 3) {
  if (!Number.isFinite(value)) return "n/a";
  return formatNumber(value, digits);
}

function getShock() {
  return {
    type: dom.shockType.value,
    sign: dom.shockSign.value,
    scale: Number(dom.shockScale.value)
  };
}

function getHorizon() {
  const value = Math.round(Number(dom.horizon.value));
  return Math.min(80, Math.max(12, Number.isFinite(value) ? value : 40));
}

function paramsFor(side) {
  return side === "benchmark" ? benchmark : alternative;
}

function setParamsFor(side, value) {
  if (side === "benchmark") benchmark = value;
  else alternative = value;
}

function minimumXi(params) {
  if (!Number.isFinite(params.n)) return 0.01;
  return Math.min(0.999, Math.max(0.01, params.n + HOME_BIAS_MARGIN));
}

function enforceHomeBias(params) {
  const minXi = minimumXi(params);
  if (Number.isFinite(params.xi) && params.xi < minXi) params.xi = minXi;
}

function markDirty() {
  dom.status.className = "status warning";
  dom.status.textContent = "Settings changed. Click Plot responses to update the charts.";
}

function labelHtml(key, fallback) {
  const labels = {
    n: "Home country size, <span class=\"math-param\">n</span>",
    foreignSize: "Foreign country size, <span class=\"math-param\">1 - n</span>",
    xi: "Home-goods share in Home CPI, <span class=\"math-param\">&xi;</span>",
    xistar: "Home-goods share in Foreign CPI, <span class=\"math-param\">&xi;<sup class=\"star-sup\">*</sup></span>",
    beta: "Discount factor, <span class=\"math-param\">&beta;</span>",
    gam: "Risk aversion, <span class=\"math-param\">&gamma;</span>",
    vphi: "Inverse Frisch elasticity, <span class=\"math-param\">&varphi;</span>",
    sig: "Trade elasticity, <span class=\"math-param\">&sigma;</span>",
    alpha: "Calvo parameter, <span class=\"math-param\">&alpha;</span>",
    rho_i: "Home interest-rate smoothing, <span class=\"math-param\">&rho;<sub>i</sub></span>",
    rho_istar: "Foreign interest-rate smoothing, <span class=\"math-param\">&rho;<sub>i<sup>*</sup></sub></span>",
    phi_pi: "Home inflation response, <span class=\"math-param\">&phi;<sub>&pi;</sub></span>",
    phi_pistar: "Foreign inflation response, <span class=\"math-param\">&phi;<sub>&pi;<sup>*</sup></sub></span>",
    phi_x: "Home slack response, <span class=\"math-param\">&phi;<sub>x</sub></span>",
    phi_xstar: "Foreign slack response, <span class=\"math-param\">&phi;<sub>x<sup>*</sup></sub></span>",
    iota: "Natural-rate tracking, <span class=\"math-param\">&iota;</span>",
    deltaa: "Home productivity persistence, <span class=\"math-param\">&delta;<sub>a</sub></span>",
    deltaastar: "Foreign productivity persistence, <span class=\"math-param\">&delta;<sub>a<sup>*</sup></sub></span>",
    stda: "Home productivity std. dev., <span class=\"math-param\">&sigma;<sub>a</sub></span>",
    stdastar: "Foreign productivity std. dev., <span class=\"math-param\">&sigma;<sub>a<sup>*</sup></sub></span>",
    corraastar: "Productivity innovation correlation, <span class=\"math-param\">&rho;<sub>aa<sup>*</sup></sub></span>",
    deltam: "Home monetary persistence, <span class=\"math-param\">&delta;<sub>m</sub></span>",
    deltamstar: "Foreign monetary persistence, <span class=\"math-param\">&delta;<sub>m<sup>*</sup></sub></span>",
    stdm: "Home monetary std. dev., <span class=\"math-param\">&sigma;<sub>m</sub></span>",
    stdmstar: "Foreign monetary std. dev., <span class=\"math-param\">&sigma;<sub>m<sup>*</sup></sub></span>",
    corrmmstar: "Monetary innovation correlation, <span class=\"math-param\">&rho;<sub>mm<sup>*</sup></sub></span>"
  };
  return labels[key] || fallback;
}

function plainLabel(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function syncParameterControls() {
  dom.parameterControls.querySelectorAll("[data-param][data-side]").forEach(input => {
    const side = input.dataset.side;
    const key = input.dataset.param;
    const params = paramsFor(side);
    if (key === "xi") input.min = minimumXi(params);
    if (key in params && Number.isFinite(params[key])) input.value = String(params[key]);
  });
}

function updateParam(side, key, value) {
  const params = paramsFor(side);
  params[key] = Number(value);
  enforceHomeBias(params);
  setParamsFor(side, params);
  syncParameterControls();
  renderImpliedValues();
  markDirty();
}

function renderEditor(key, label, min, max, step, side) {
  const params = paramsFor(side);
  const ariaLabel = plainLabel(labelHtml(key, label));
  if (key === "iota") {
    return `
      <select data-side="${side}" data-param="${key}" aria-label="${ariaLabel}, ${side}">
        <option value="0"${Number(params[key]) === 0 ? " selected" : ""}>Standard Taylor rule</option>
        <option value="1"${Number(params[key]) === 1 ? " selected" : ""}>Wicksellian rule</option>
      </select>
    `;
  }
  const controlMin = key === "xi" ? minimumXi(params) : min;
  const value = Number.isFinite(params[key]) ? params[key] : min;
  return `
    <div class="param-editor">
      <input type="range" min="${controlMin}" max="${max}" step="${step}" value="${value}" data-side="${side}" data-param="${key}" aria-label="${ariaLabel}, ${side} slider">
      <input type="number" min="${controlMin}" max="${max}" step="${step}" value="${value}" data-side="${side}" data-param="${key}" aria-label="${ariaLabel}, ${side} exact value">
    </div>
  `;
}

function impliedValue(key, side) {
  const params = paramsFor(side);
  if (key === "foreignSize") return 1 - params.n;
  if (key === "xistar") return getXistar(params);
  return NaN;
}

function renderReadOnlyValue(key, side) {
  return `
    <div class="readonly-value" data-implied="${key}" data-side="${side}">
      ${formatNumber(impliedValue(key, side), 6)}
    </div>
  `;
}

function structuralRowsFor(params) {
  const rows = [];
  params.forEach(row => {
    rows.push(row);
    if (row[0] === "n") rows.push(["foreignSize", "", null, null, null, true]);
    if (row[0] === "xi") rows.push(["xistar", "", null, null, null, true]);
  });
  return rows;
}

function rowsForGroup(group) {
  return group.title === "Structural parameters" ? structuralRowsFor(group.params) : group.params;
}

function renderParameterControls() {
  dom.parameterControls.innerHTML = PARAM_GROUPS.map(group => `
    <details class="parameter-group" open>
      <summary>${group.title}</summary>
      <div class="group-body">
        <p class="small">${group.help}</p>
        <div class="param-grid header-row">
          <span>Parameter</span>
          <span>Benchmark</span>
          <span>Alternative</span>
        </div>
        ${rowsForGroup(group).map(([key, label, min, max, step, readOnly]) => `
          <div class="param-grid">
            <label for="param-${key}-benchmark">${labelHtml(key, label)}</label>
            ${readOnly ? renderReadOnlyValue(key, "benchmark") : renderEditor(key, label, min, max, step, "benchmark")}
            ${readOnly ? renderReadOnlyValue(key, "alternative") : renderEditor(key, label, min, max, step, "alternative")}
          </div>
        `).join("")}
      </div>
    </details>
  `).join("");

  dom.parameterControls.querySelectorAll("[data-param][data-side]").forEach(input => {
    input.addEventListener("input", event => {
      updateParam(event.currentTarget.dataset.side, event.currentTarget.dataset.param, event.currentTarget.value);
    });
  });
}

function renderImpliedValues() {
  enforceHomeBias(benchmark);
  enforceHomeBias(alternative);
  dom.parameterControls.querySelectorAll("[data-implied][data-side]").forEach(element => {
    element.textContent = formatNumber(impliedValue(element.dataset.implied, element.dataset.side), 6);
  });
}

function renderStatus(benchmarkValidation, alternativeValidation) {
  const warnings = [
    ...(benchmarkValidation.warnings || []).map(text => `Benchmark: ${text}`),
    ...(alternativeValidation.warnings || []).map(text => `Alternative: ${text}`)
  ];

  dom.status.className = "status";
  if (warnings.length) {
    dom.status.classList.add("warning");
    dom.status.textContent = warnings.join(" ");
  } else {
    dom.status.textContent = "Impulse responses plotted. The impact of the selected shock is recorded in quarter 1.";
  }
}

function niceTicks(min, max, count = 5) {
  if (Math.abs(max - min) < 1e-10) {
    const bump = Math.max(1e-4, Math.abs(max) * 0.2);
    min -= bump;
    max += bump;
  }
  return Array.from({ length: count }, (_, i) => min + (i * (max - min)) / (count - 1));
}

function quarterTicks(horizon) {
  const ticks = [1, Math.round(horizon / 4), Math.round(horizon / 2), Math.round((3 * horizon) / 4), horizon];
  return Array.from(new Set(ticks.map(t => Math.min(horizon, Math.max(1, t)))));
}

function getSeriesValue(row, series, layer = "primary") {
  if (layer === "secondary" && series.secondaryVariable) return row[series.secondaryVariable];
  if (series.id === "growth") return row.growth;
  if (series.id === "growthStar") return row.growthStar;
  return row[series.variable];
}

function pathFor(rows, series, scaleX, scaleY, layer = "primary") {
  return rows.map((row, index) => {
    const command = index === 0 ? "M" : "L";
    const quarter = row.period + 1;
    return `${command}${scaleX(quarter).toFixed(2)},${scaleY(getSeriesValue(row, series, layer)).toFixed(2)}`;
  }).join(" ");
}

function svgEscape(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lineClass(series, side, layer = "primary") {
  const layerClass = layer === "secondary" ? " secondary" : "";
  if (series.group !== "shock") return `chart-line ${side}${layerClass}`;
  const kind = series.shockKind === "productivity" ? "productivity" : "monetary";
  return `chart-line shock-line ${kind} ${side}`;
}

function renderChart(series) {
  const width = 760;
  const height = 340;
  const margin = { top: 30, right: 22, bottom: 58, left: 70 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const rowsB = latest.benchmark.rows;
  const rowsA = latest.alternative.rows;
  const allValues = [...rowsB, ...rowsA].flatMap(row => {
    const values = [getSeriesValue(row, series)];
    if (series.secondaryVariable) values.push(getSeriesValue(row, series, "secondary"));
    return values;
  }).filter(Number.isFinite);
  let minY = Math.min(...allValues, 0);
  let maxY = Math.max(...allValues, 0);
  const pad = Math.max(1e-5, (maxY - minY) * 0.08);
  minY -= pad;
  maxY += pad;

  const horizon = rowsB.length;
  const scaleX = q => margin.left + ((q - 1) / Math.max(1, horizon - 1)) * plotWidth;
  const scaleY = y => margin.top + (1 - (y - minY) / (maxY - minY)) * plotHeight;
  const yTicks = niceTicks(minY, maxY, 5);
  const xTicks = quarterTicks(horizon);
  const zeroY = scaleY(0);

  const yGrid = yTicks.map(tick => `
    <text class="axis-label" x="${margin.left - 8}" y="${(scaleY(tick) + 4).toFixed(2)}" text-anchor="end">${svgEscape(formatSigned(tick, 2))}</text>
  `).join("");
  const xGrid = xTicks.map(tick => `
    <text class="axis-label" x="${scaleX(tick).toFixed(2)}" y="${height - 28}" text-anchor="middle">${tick}</text>
  `).join("");

  return `
    <svg class="chart" data-chart-id="${series.id}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${svgEscape(series.label)} impulse response">
      <text class="axis-unit" x="${margin.left - 46}" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 ${margin.left - 46} ${margin.top + plotHeight / 2})">%</text>
      ${yGrid}
      <line class="zero-line" x1="${margin.left}" x2="${width - margin.right}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}"></line>
      <line class="axis" x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}"></line>
      <line class="axis" x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}"></line>
      ${xGrid}
      <text class="axis-label" x="${margin.left + plotWidth / 2}" y="${height - 7}" text-anchor="middle">quarters</text>
      ${series.secondaryVariable ? `<path class="${lineClass(series, "alternative", "secondary")}" d="${pathFor(rowsA, series, scaleX, scaleY, "secondary")}"></path>` : ""}
      <path class="${lineClass(series, "alternative")}" d="${pathFor(rowsA, series, scaleX, scaleY)}"></path>
      ${series.secondaryVariable ? `<path class="${lineClass(series, "benchmark", "secondary")}" d="${pathFor(rowsB, series, scaleX, scaleY, "secondary")}"></path>` : ""}
      <path class="${lineClass(series, "benchmark")}" d="${pathFor(rowsB, series, scaleX, scaleY)}"></path>
    </svg>
  `;
}

function renderChartCard(series) {
  return `
    <article class="chart-card">
      <div class="chart-head">
        <div>
          <h3>${series.label}</h3>
          <p>${series.unit}${series.note ? ` | ${series.note}` : ""}</p>
        </div>
        <button class="svg-button" type="button" data-download-svg="${series.id}">SVG</button>
      </div>
      ${renderChart(series)}
    </article>
  `;
}

function renderCharts() {
  dom.charts.innerHTML = CHART_GROUPS.map(([groupId, groupLabel]) => {
    const groupSeries = SERIES.filter(series => series.group === groupId);
    const seriesById = Object.fromEntries(groupSeries.map(series => [series.id, series]));
    const rows = CHART_LAYOUTS[groupId] || [groupSeries.map(series => series.id)];
    return `
      <section class="chart-section ${groupId}">
        <h2>${groupLabel}</h2>
        <div class="chart-grid">
          ${rows.map(row => `
            <div class="chart-row ${row.length === 1 ? "single" : ""}">
              ${row.map(seriesId => renderChartCard(seriesById[seriesId])).join("")}
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");

  dom.charts.querySelectorAll("[data-download-svg]").forEach(button => {
    button.addEventListener("click", () => downloadChart(button.dataset.downloadSvg));
  });
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  if (value == null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function buildCsv() {
  if (!latest) return "";
  const header = ["quarter"];
  SERIES.forEach(series => {
    header.push(`benchmark_${series.id}`, `alternative_${series.id}`);
    if (series.secondaryVariable) header.push(`benchmark_${series.secondaryVariable}`, `alternative_${series.secondaryVariable}`);
  });
  const lines = [header.map(csvEscape).join(",")];
  latest.benchmark.rows.forEach((rowB, idx) => {
    const rowA = latest.alternative.rows[idx];
    const line = [rowB.period + 1];
    SERIES.forEach(series => {
      line.push(getSeriesValue(rowB, series), getSeriesValue(rowA, series));
      if (series.secondaryVariable) line.push(getSeriesValue(rowB, series, "secondary"), getSeriesValue(rowA, series, "secondary"));
    });
    lines.push(line.map(csvEscape).join(","));
  });
  return lines.join("\n");
}

function downloadChart(seriesId) {
  const svg = dom.charts.querySelector(`svg[data-chart-id="${seriesId}"]`);
  if (!svg) return;
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const css = `
    <style>
      .axis{stroke:#111;stroke-width:2}.grid-line{display:none}
      .axis-label,.axis-unit{fill:#111;font:700 15px Arial,Helvetica,sans-serif}
      .axis-unit{font-size:16px}
      .chart-line.benchmark{fill:none;stroke:#111;stroke-width:3.2}
      .chart-line.alternative{fill:none;stroke:#1f6fb2;stroke-width:3.2}
      .chart-line.secondary{stroke-dasharray:8 6}
      .shock-line.productivity.benchmark{stroke:#8b2f2a}.shock-line.productivity.alternative{stroke:#c95d50}
      .shock-line.monetary.benchmark{stroke:#7a3f18}.shock-line.monetary.alternative{stroke:#c46d2d}
      .zero-line{stroke:#555;stroke-width:1.5;stroke-dasharray:3 3}
    </style>
  `;
  clone.insertAdjacentHTML("afterbegin", css);
  downloadBlob(`${seriesId}_irf.svg`, new XMLSerializer().serializeToString(clone), "image/svg+xml");
}

function run() {
  try {
    const horizon = getHorizon();
    dom.horizon.value = String(horizon);
    enforceHomeBias(benchmark);
    enforceHomeBias(alternative);
    syncParameterControls();
    renderImpliedValues();

    const shock = getShock();
    const benchmarkValidation = validateParams(benchmark);
    const alternativeValidation = validateParams(alternative);
    if (!benchmarkValidation.ok) throw new Error(`Benchmark: ${benchmarkValidation.messages.join(" ")}`);
    if (!alternativeValidation.ok) throw new Error(`Alternative: ${alternativeValidation.messages.join(" ")}`);

    latest = {
      benchmark: solveModel(benchmark, shock, horizon),
      alternative: solveModel(alternative, shock, horizon)
    };
    renderStatus(benchmarkValidation, alternativeValidation);
    renderCharts();
  } catch (error) {
    dom.status.className = "status error";
    dom.status.textContent = error.message;
  }
}

function wireEvents() {
  [dom.shockType, dom.shockSign, dom.shockScale, dom.horizon].forEach(input => {
    input.addEventListener("input", markDirty);
  });

  dom.plotButton.addEventListener("click", run);

  dom.resetBoth.addEventListener("click", () => {
    benchmark = cloneParams(PAPER_PARAMS);
    alternative = cloneParams(PAPER_PARAMS);
    renderParameterControls();
    renderImpliedValues();
    markDirty();
  });

  dom.copyBenchmark.addEventListener("click", () => {
    alternative = cloneParams(benchmark);
    renderParameterControls();
    renderImpliedValues();
    markDirty();
  });

  dom.downloadCsv.addEventListener("click", () => {
    downloadBlob("global_slack_irfs.csv", buildCsv(), "text/csv");
  });
}

renderParameterControls();
renderImpliedValues();
wireEvents();
run();
