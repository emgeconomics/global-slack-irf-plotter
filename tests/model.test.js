import test from "node:test";
import assert from "node:assert/strict";
import {
  PAPER_PARAMS,
  alphaFromClosedEconomySlope,
  cloneParams,
  getClosedEconomySlope,
  generateStandardizedInnovations,
  checkImpulseResponseConvergence,
  simulateModel,
  computeMomentVector,
  MOMENT_IDS,
  solveModel,
  validateParams
} from "../model.js";

const SHOCKS = [
  "eps_a", "eps_astar", "eps_m", "eps_mstar",
  "eps_mu", "eps_mustar", "eps_d", "eps_dstar"
];

function maxDifference(rowsA, rowsB, keys) {
  let result = 0;
  for (let t = 0; t < rowsA.length; t++) {
    for (const key of keys) result = Math.max(result, Math.abs(rowsA[t][key] - rowsB[t][key]));
  }
  return result;
}

test("paper parameter object is admissible", () => {
  const validation = validateParams(PAPER_PARAMS);
  assert.equal(validation.ok, true, validation.messages.join(" "));
  assert.ok(validation.composite.D > 0);
});

test("open-economy slopes add to the closed-economy curvature", () => {
  const validation = validateParams(PAPER_PARAMS);
  const c = validation.composite;
  assert.ok(Math.abs(c.Psi1 + c.Psi2 - (PAPER_PARAMS.gam + PAPER_PARAMS.vphi)) < 1e-10);
  assert.ok(Math.abs(c.closedEconomySlope - getClosedEconomySlope(PAPER_PARAMS)) < 1e-12);
});

test("closed-economy slope maps back to the original Calvo parameter", () => {
  const slope = getClosedEconomySlope(PAPER_PARAMS);
  const alpha = alphaFromClosedEconomySlope(slope, PAPER_PARAMS.beta, PAPER_PARAMS.gam, PAPER_PARAMS.vphi);
  assert.ok(Math.abs(alpha - PAPER_PARAMS.alpha) < 1e-12);
});

test("all eight benchmark shocks produce finite solutions", () => {
  for (const type of SHOCKS) {
    const result = solveModel(PAPER_PARAMS, { type, sign: "positive", scale: 1 }, 40);
    assert.equal(result.rows.length, 40);
    for (const row of result.rows) {
      for (const value of Object.values(row)) assert.ok(Number.isFinite(value), `${type} returned a non-finite value`);
    }
  }
});

test("positive markup shocks raise the corresponding producer-origin CPI pressure", () => {
  const home = solveModel(PAPER_PARAMS, { type: "eps_mu", sign: "positive", scale: 1 }, 40);
  const foreign = solveModel(PAPER_PARAMS, { type: "eps_mustar", sign: "positive", scale: 1 }, 40);
  assert.ok(home.rows[0].pi > 0, `Home inflation impact was ${home.rows[0].pi}`);
  assert.ok(foreign.rows[0].pistar > 0, `Foreign inflation impact was ${foreign.rows[0].pistar}`);
});

test("positive aggregate-demand shocks raise the corresponding output gap on impact", () => {
  const home = solveModel(PAPER_PARAMS, { type: "eps_d", sign: "positive", scale: 1 }, 40);
  const foreign = solveModel(PAPER_PARAMS, { type: "eps_dstar", sign: "positive", scale: 1 }, 40);
  assert.ok(home.rows[0].x > 0, `Home output-gap impact was ${home.rows[0].x}`);
  assert.ok(foreign.rows[0].xstar > 0, `Foreign output-gap impact was ${foreign.rows[0].xstar}`);
});

test("shock states obey their configured AR(1) laws", () => {
  const params = cloneParams(PAPER_PARAMS);
  params.deltam = 0.6;
  params.deltamu = 0.7;
  params.deltad = 0.8;

  const monetary = solveModel(params, { type: "eps_m", sign: "positive", scale: 1 }, 12);
  const markup = solveModel(params, { type: "eps_mu", sign: "positive", scale: 1 }, 12);
  const demand = solveModel(params, { type: "eps_d", sign: "positive", scale: 1 }, 12);

  assert.ok(Math.abs(monetary.rows[1].m / monetary.rows[0].m - 0.6) < 1e-10);
  assert.ok(Math.abs(markup.rows[1].mu / markup.rows[0].mu - 0.7) < 1e-10);
  assert.ok(Math.abs(demand.rows[1].d / demand.rows[0].d - 0.8) < 1e-10);
});

test("new-shock settings do not alter legacy-shock IRFs when those shocks are not selected", () => {
  const alternative = cloneParams(PAPER_PARAMS);
  alternative.deltamu = 0.1;
  alternative.deltamustar = 0.9;
  alternative.stdmu = 4;
  alternative.stdmustar = 3;
  alternative.deltad = 0.2;
  alternative.deltadstar = 0.85;
  alternative.stdd = 2;
  alternative.stddstar = 1;

  const baseline = solveModel(PAPER_PARAMS, { type: "eps_a", sign: "positive", scale: 1 }, 40);
  const changed = solveModel(alternative, { type: "eps_a", sign: "positive", scale: 1 }, 40);
  const keys = ["pi", "pistar", "x", "xstar", "y", "ystar", "i", "istar", "a", "astar", "m", "mstar"];
  assert.ok(maxDifference(baseline.rows, changed.rows, keys) < 1e-10);
});

test("zero innovation standard deviation gives an exactly zero response", () => {
  const params = cloneParams(PAPER_PARAMS);
  params.stdmu = 0;
  const result = solveModel(params, { type: "eps_mu", sign: "positive", scale: 1 }, 20);
  for (const row of result.rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key !== "period") assert.ok(Math.abs(value) < 1e-12, `${key} was not zero: ${value}`);
    }
  }
});

test("standardized innovation draws are exactly reproducible under a fixed seed", () => {
  const first = generateStandardizedInnovations(PAPER_PARAMS, 500, 12345);
  const second = generateStandardizedInnovations(PAPER_PARAMS, 500, 12345);
  for (const type of SHOCKS) {
    assert.deepEqual(Array.from(first[type]), Array.from(second[type]));
  }
});

test("innovation generators reproduce configured cross-country correlations", () => {
  const params = cloneParams(PAPER_PARAMS);
  params.corraastar = 0.35;
  params.corrmmstar = -0.25;
  params.corrmumustar = 0.55;
  params.corrddstar = 0.15;
  const innovations = generateStandardizedInnovations(params, 200000, 24680);
  const sampleCorrelation = (left, right) => {
    let sumL = 0;
    let sumR = 0;
    for (let i = 0; i < left.length; i++) {
      sumL += left[i];
      sumR += right[i];
    }
    const meanL = sumL / left.length;
    const meanR = sumR / right.length;
    let numerator = 0;
    let sumsqL = 0;
    let sumsqR = 0;
    for (let i = 0; i < left.length; i++) {
      const dl = left[i] - meanL;
      const dr = right[i] - meanR;
      numerator += dl * dr;
      sumsqL += dl * dl;
      sumsqR += dr * dr;
    }
    return numerator / Math.sqrt(sumsqL * sumsqR);
  };
  const pairs = [
    ["eps_a", "eps_astar", params.corraastar],
    ["eps_m", "eps_mstar", params.corrmmstar],
    ["eps_mu", "eps_mustar", params.corrmumustar],
    ["eps_d", "eps_dstar", params.corrddstar]
  ];
  for (const [home, foreign, target] of pairs) {
    const actual = sampleCorrelation(innovations[home], innovations[foreign]);
    assert.ok(Math.abs(actual - target) < 0.01, `${home}/${foreign}: ${actual} versus ${target}`);
  }
});

test("finite-horizon IRFs converge over the moment-relevant window", () => {
  const result = checkImpulseResponseConvergence(PAPER_PARAMS, {
    shortHorizon: 160,
    longHorizon: 240,
    checkPeriods: 40,
    tolerance: 1e-7
  });
  assert.equal(result.ok, true, JSON.stringify(result));
});

test("stochastic simulation is finite, reproducible, and returns the requested sample length", () => {
  const options = { periods: 120, burnIn: 120, responseHorizon: 120, seed: 98765 };
  const first = simulateModel(PAPER_PARAMS, options);
  const second = simulateModel(PAPER_PARAMS, options);
  assert.equal(first.rows.length, options.periods);
  assert.deepEqual(first.rows, second.rows);
  for (const row of first.rows) {
    for (const value of Object.values(row)) assert.ok(Number.isFinite(value));
  }
});

test("the SMM moment function returns the frozen 27-moment vector", () => {
  const simulation = simulateModel(PAPER_PARAMS, {
    periods: 183,
    burnIn: 150,
    responseHorizon: 120,
    seed: 314159
  });
  const moments = computeMomentVector(simulation.rows);
  assert.equal(moments.values.length, 27);
  assert.deepEqual(moments.ids, MOMENT_IDS);
  assert.equal(moments.observations, 183);
  for (const value of moments.values) assert.ok(Number.isFinite(value));
});
