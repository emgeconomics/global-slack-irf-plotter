import { PAPER_PARAMS, cloneParams, solveModel } from "./model.js";

const ADDED_SHOCKS = [
  ["eps_mu", "Home markup"],
  ["eps_mustar", "Foreign markup"],
  ["eps_d", "Home Euler/aggregate-demand wedge"],
  ["eps_dstar", "Foreign Euler/aggregate-demand wedge"]
];

const PROCESS_SERIES = [
  ["mu", "Home markup wedge"],
  ["mustar", "Foreign markup wedge"],
  ["d", "Home Euler wedge"],
  ["dstar", "Foreign Euler wedge"]
];

function addShockOptions() {
  const select = document.getElementById("shockType");
  if (!select) return;
  for (const [value, label] of ADDED_SHOCKS) {
    if (select.querySelector(`option[value="${value}"]`)) continue;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

function readParams(side) {
  const params = cloneParams(PAPER_PARAMS);
  document.querySelectorAll(`[data-side="${side}"][data-param]`).forEach(input => {
    const value = Number(input.value);
    if (Number.isFinite(value)) params[input.dataset.param] = value;
  });
  return params;
}

function readShock() {
  return {
    type: document.getElementById("shockType")?.value || "eps_a",
    sign: document.getElementById("shockSign")?.value || "positive",
    scale: Number(document.getElementById("shockScale")?.value || 1)
  };
}

function readHorizon() {
  const value = Math.round(Number(document.getElementById("horizon")?.value || 40));
  return Math.min(80, Math.max(12, Number.isFinite(value) ? value : 40));
}

function linePath(rows, key, width, height, bounds) {
  const left = 48;
  const right = 14;
  const top = 22;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const scaleX = index => left + (index / Math.max(1, rows.length - 1)) * plotWidth;
  const scaleY = value => top + (1 - (value - bounds.min) / (bounds.max - bounds.min)) * plotHeight;
  return rows.map((row, index) => `${index === 0 ? "M" : "L"}${scaleX(index).toFixed(2)},${scaleY(row[key]).toFixed(2)}`).join(" ");
}

function processChart(key, title, benchmarkRows, alternativeRows) {
  const width = 520;
  const height = 250;
  const values = [...benchmarkRows, ...alternativeRows].map(row => row[key]).filter(Number.isFinite);
  let min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  if (Math.abs(max - min) < 1e-12) {
    min = -0.01;
    max = 0.01;
  } else {
    const pad = 0.08 * (max - min);
    min -= pad;
    max += pad;
  }
  const zeroY = 22 + (1 - (0 - min) / (max - min)) * (height - 22 - 38);
  const benchmarkPath = linePath(benchmarkRows, key, width, height, { min, max });
  const alternativePath = linePath(alternativeRows, key, width, height, { min, max });
  const horizon = benchmarkRows.length;

  return `
    <article class="r2-process-card">
      <h4>${title}</h4>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title} impulse response">
        <line x1="48" x2="${width - 14}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" class="r2-zero" />
        <line x1="48" x2="48" y1="22" y2="${height - 38}" class="r2-axis" />
        <line x1="48" x2="${width - 14}" y1="${height - 38}" y2="${height - 38}" class="r2-axis" />
        <path d="${benchmarkPath}" class="r2-line r2-benchmark" />
        <path d="${alternativePath}" class="r2-line r2-alternative" />
        <text x="48" y="${height - 12}" class="r2-label">1</text>
        <text x="${width - 14}" y="${height - 12}" text-anchor="end" class="r2-label">${horizon}</text>
        <text x="8" y="30" class="r2-label">${max.toFixed(3)}</text>
        <text x="8" y="${height - 40}" class="r2-label">${min.toFixed(3)}</text>
      </svg>
    </article>`;
}

function ensureStyles() {
  if (document.getElementById("r2-extension-styles")) return;
  const style = document.createElement("style");
  style.id = "r2-extension-styles";
  style.textContent = `
    .r2-process-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #d9d9d9; }
    .r2-process-section h3 { margin: 0 0 .4rem; }
    .r2-process-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .r2-process-card { border: 1px solid #dedede; border-radius: 6px; padding: .8rem; background: #fff; }
    .r2-process-card h4 { margin: 0 0 .5rem; font-size: 1rem; }
    .r2-process-card svg { width: 100%; height: auto; display: block; }
    .r2-line { fill: none; stroke-width: 2.2; }
    .r2-benchmark { stroke: #111; }
    .r2-alternative { stroke: #1a73e8; }
    .r2-axis { stroke: #777; stroke-width: 1; }
    .r2-zero { stroke: #bbb; stroke-width: 1; stroke-dasharray: 4 4; }
    .r2-label { font-family: Lato, sans-serif; font-size: 12px; fill: #555; }
    @media (max-width: 760px) { .r2-process-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
}

function renderAddedShockProcesses() {
  const charts = document.getElementById("charts");
  if (!charts) return;
  charts.querySelector(".r2-process-section")?.remove();

  try {
    const shock = readShock();
    const horizon = readHorizon();
    const benchmark = solveModel(readParams("benchmark"), shock, horizon);
    const alternative = solveModel(readParams("alternative"), shock, horizon);
    const section = document.createElement("section");
    section.className = "r2-process-section";
    section.innerHTML = `
      <h3>Added shock processes</h3>
      <p class="small">These panels report the new markup and Euler/aggregate-demand state variables. Black is the benchmark; blue is the alternative parameterization.</p>
      <div class="r2-process-grid">
        ${PROCESS_SERIES.map(([key, title]) => processChart(key, title, benchmark.rows, alternative.rows)).join("")}
      </div>`;
    charts.appendChild(section);
  } catch (error) {
    const section = document.createElement("section");
    section.className = "r2-process-section";
    section.innerHTML = `<h3>Added shock processes</h3><p class="small">Unable to render extension panels: ${String(error.message || error)}</p>`;
    charts.appendChild(section);
  }
}

function initialize() {
  addShockOptions();
  ensureStyles();
  const plotButton = document.getElementById("plotButton");
  plotButton?.addEventListener("click", () => window.setTimeout(renderAddedShockProcesses, 0));
  window.setTimeout(renderAddedShockProcesses, 0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
