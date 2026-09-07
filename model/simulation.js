import { solveModel } from "./system.js";

export const SHOCK_TYPES = Object.freeze([
  "eps_a", "eps_astar", "eps_m", "eps_mstar",
  "eps_mu", "eps_mustar", "eps_d", "eps_dstar"
]);

const SHOCK_FAMILIES = Object.freeze([
  ["eps_a", "eps_astar", "corraastar"],
  ["eps_m", "eps_mstar", "corrmmstar"],
  ["eps_mu", "eps_mustar", "corrmumustar"],
  ["eps_d", "eps_dstar", "corrddstar"]
]);

export const SIMULATION_SERIES = Object.freeze([
  "a", "astar", "y", "ystar", "i", "istar", "m", "mstar",
  "mu", "mustar", "d", "dstar", "pi", "pistar", "in", "instar",
  "x", "xstar", "tot", "rs", "tb"
]);

function assertPositiveInteger(value, name, minimum = 1) {
  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${name} must be an integer of at least ${minimum}.`);
  }
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function standardNormalPair(random) {
  let u1 = random();
  const u2 = random();
  if (u1 <= Number.EPSILON) u1 = Number.EPSILON;
  const radius = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

export function generateStandardizedInnovations(params, periods, seed = 20260811) {
  assertPositiveInteger(periods, "periods");
  if (!Number.isInteger(seed)) throw new Error("seed must be an integer.");
  const innovations = Object.fromEntries(SHOCK_TYPES.map(type => [type, new Float64Array(periods)]));
  const random = mulberry32(seed);

  for (let t = 0; t < periods; t++) {
    for (const [homeType, foreignType, correlationName] of SHOCK_FAMILIES) {
      const correlation = Number(params[correlationName]);
      if (!(correlation > -1 && correlation < 1)) {
        throw new Error(`${correlationName} must be strictly between -1 and 1.`);
      }
      const [z1, z2] = standardNormalPair(random);
      innovations[homeType][t] = z1;
      innovations[foreignType][t] = correlation * z1 + Math.sqrt(1 - correlation ** 2) * z2;
    }
  }
  return innovations;
}

export function buildImpulseResponseLibrary(params, responseHorizon = 160) {
  assertPositiveInteger(responseHorizon, "responseHorizon", 2);
  const library = {};
  for (const type of SHOCK_TYPES) {
    const solved = solveModel(params, { type, sign: "positive", scale: 1 }, responseHorizon);
    library[type] = Object.fromEntries(
      SIMULATION_SERIES.map(series => [series, Float64Array.from(solved.rows, row => Number(row[series] || 0))])
    );
  }
  return library;
}

export function checkImpulseResponseConvergence(
  params,
  { shortHorizon = 160, longHorizon = 240, checkPeriods = 40, tolerance = 1e-8 } = {}
) {
  assertPositiveInteger(shortHorizon, "shortHorizon", 2);
  assertPositiveInteger(longHorizon, "longHorizon", shortHorizon + 1);
  assertPositiveInteger(checkPeriods, "checkPeriods", 1);
  if (!(tolerance > 0)) throw new Error("tolerance must be positive.");
  if (checkPeriods > shortHorizon) throw new Error("checkPeriods cannot exceed shortHorizon.");

  const shortLibrary = buildImpulseResponseLibrary(params, shortHorizon);
  const longLibrary = buildImpulseResponseLibrary(params, longHorizon);
  let maxDifference = 0;
  let location = null;
  for (const type of SHOCK_TYPES) {
    for (const series of SIMULATION_SERIES) {
      for (let t = 0; t < checkPeriods; t++) {
        const difference = Math.abs(shortLibrary[type][series][t] - longLibrary[type][series][t]);
        if (difference > maxDifference) {
          maxDifference = difference;
          location = { type, series, period: t };
        }
      }
    }
  }
  return { ok: maxDifference <= tolerance, maxDifference, tolerance, location };
}

export function simulateModel(
  params,
  {
    periods = 183,
    burnIn = 500,
    responseHorizon = 160,
    seed = 20260811,
    impulseLibrary = null
  } = {}
) {
  assertPositiveInteger(periods, "periods");
  assertPositiveInteger(burnIn, "burnIn", 0);
  assertPositiveInteger(responseHorizon, "responseHorizon", 2);
  const totalPeriods = periods + burnIn;
  const innovations = generateStandardizedInnovations(params, totalPeriods, seed);
  const library = impulseLibrary || buildImpulseResponseLibrary(params, responseHorizon);
  const paths = Object.fromEntries(SIMULATION_SERIES.map(series => [series, new Float64Array(totalPeriods)]));

  for (const type of SHOCK_TYPES) {
    const shockPath = innovations[type];
    for (const series of SIMULATION_SERIES) {
      const coefficients = library[type][series];
      const output = paths[series];
      for (let lag = 0; lag < responseHorizon; lag++) {
        const coefficient = coefficients[lag];
        if (coefficient === 0) continue;
        for (let t = lag; t < totalPeriods; t++) {
          output[t] += coefficient * shockPath[t - lag];
        }
      }
    }
  }

  const rows = new Array(periods);
  for (let sampleIndex = 0; sampleIndex < periods; sampleIndex++) {
    const t = burnIn + sampleIndex;
    const row = { period: sampleIndex };
    for (const series of SIMULATION_SERIES) row[series] = paths[series][t];
    const previousY = t === 0 ? 0 : paths.y[t - 1];
    const previousYstar = t === 0 ? 0 : paths.ystar[t - 1];
    row.growth = row.y - previousY;
    row.growthStar = row.ystar - previousYstar;
    row.employment = row.y - row.a;
    row.employmentStar = row.ystar - row.astar;
    row.totstar = -row.tot;
    row.rsstar = -row.rs;
    row.tbstar = -row.tb;
    rows[sampleIndex] = row;
  }

  return {
    rows,
    innovations,
    metadata: { periods, burnIn, responseHorizon, seed }
  };
}
