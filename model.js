const VARS = [
  "a", "astar", "y", "ystar", "i", "istar", "m", "mstar",
  "pi", "pistar", "pil1", "in", "instar", "x", "xstar"
];

const IDX = Object.fromEntries(VARS.map((name, i) => [name, i]));
const NVAR = VARS.length;

export const PAPER_PARAMS = Object.freeze({
  beta: 0.995,
  gam: 5,
  vphi: 5,
  sig: 1.5,
  alpha: 0.75,
  n: 0.15507142857142855,
  xi: 0.8512857142857143,
  rho_i: 0.78,
  rho_istar: 0.78,
  phi_pi: 1.33,
  phi_pistar: 1.33,
  phi_x: 1.29,
  phi_xstar: 1.29,
  iota: 0,
  iotastar: 0,
  deltaa: 0.95,
  deltaastar: 0.95,
  stda: 0.7,
  stdastar: 0.7,
  corraastar: 0.25,
  deltam: 0,
  deltamstar: 0,
  stdm: 0.38,
  stdmstar: 0.38,
  corrmmstar: 0.5
});

export const PARAM_GROUPS = [
  {
    title: "Structural parameters",
    help: "Country size, openness, preferences, substitution, and price rigidity.",
    params: [
      ["n", "Home country size, n", 0.01, 0.95, 0.001],
      ["xi", "Home-goods share, xi", 0.01, 0.999, 0.001],
      ["beta", "Discount factor, beta", 0.9, 0.999, 0.001],
      ["gam", "Risk aversion, gamma", 0.1, 20, 0.1],
      ["vphi", "Inverse Frisch elasticity, varphi", 0.1, 20, 0.1],
      ["sig", "Trade elasticity, sigma", 0.1, 10, 0.05],
      ["alpha", "Calvo parameter, alpha", 0.01, 0.99, 0.01]
    ]
  },
  {
    title: "Monetary policy rule",
    help: "Taylor-rule inertia and responses. Wicksellian rules also track the natural rate.",
    params: [
      ["rho_i", "Home interest-rate smoothing", 0, 0.99, 0.01],
      ["rho_istar", "Foreign interest-rate smoothing", 0, 0.99, 0.01],
      ["phi_pi", "Home inflation response", 0, 5, 0.01],
      ["phi_pistar", "Foreign inflation response", 0, 5, 0.01],
      ["phi_x", "Home slack response", 0, 5, 0.01],
      ["phi_xstar", "Foreign slack response", 0, 5, 0.01],
      ["iota", "Home natural-rate tracking, iota", 0, 1, 1],
      ["iotastar", "Foreign natural-rate tracking, iota*", 0, 1, 1]
    ]
  },
  {
    title: "Shock processes",
    help: "Innovation standard deviations and persistence. Correlations are shown for consistency with the stochastic model.",
    params: [
      ["deltaa", "Home productivity persistence", 0, 0.999, 0.001],
      ["deltaastar", "Foreign productivity persistence", 0, 0.999, 0.001],
      ["stda", "Home productivity std. dev.", 0.001, 5, 0.001],
      ["stdastar", "Foreign productivity std. dev.", 0.001, 5, 0.001],
      ["corraastar", "Productivity innovation correlation", -0.99, 0.99, 0.01],
      ["deltam", "Home monetary persistence", 0, 0.999, 0.001],
      ["deltamstar", "Foreign monetary persistence", 0, 0.999, 0.001],
      ["stdm", "Home monetary std. dev.", 0.001, 5, 0.001],
      ["stdmstar", "Foreign monetary std. dev.", 0.001, 5, 0.001],
      ["corrmmstar", "Monetary innovation correlation", -0.99, 0.99, 0.01]
    ]
  }
];

export const SERIES = [
  { id: "pi", group: "home", label: "Home inflation", variable: "pi", transform: "level", unit: "percent" },
  { id: "employment", group: "home", label: "Home employment", variable: "employment", transform: "level", unit: "percent deviation from steady state" },
  { id: "y", group: "home", label: "Home output", variable: "y", transform: "level", unit: "percent deviation from steady state" },
  { id: "growth", group: "home", label: "Home output growth", variable: "y", transform: "diff", unit: "percent log difference" },
  { id: "i", group: "home", label: "Home interest rate", variable: "i", transform: "level", unit: "percent" },
  { id: "in", group: "home", label: "Home natural interest rate", variable: "in", transform: "level", unit: "percent" },
  { id: "tb", group: "home", label: "Home trade balance", variable: "tb", transform: "level", unit: "percent" },
  { id: "tot", group: "home", label: "Home terms of trade and real exchange rate", variable: "tot", secondaryVariable: "rs", transform: "level", unit: "percent deviation from steady state", note: "Solid: terms of trade. Dashed: real exchange rate." },
  { id: "pistar", group: "foreign", label: "Foreign inflation", variable: "pistar", transform: "level", unit: "percent" },
  { id: "employmentStar", group: "foreign", label: "Foreign employment", variable: "employmentStar", transform: "level", unit: "percent deviation from steady state" },
  { id: "ystar", group: "foreign", label: "Foreign output", variable: "ystar", transform: "level", unit: "percent deviation from steady state" },
  { id: "growthStar", group: "foreign", label: "Foreign output growth", variable: "ystar", transform: "diff", unit: "percent log difference" },
  { id: "istar", group: "foreign", label: "Foreign interest rate", variable: "istar", transform: "level", unit: "percent" },
  { id: "instar", group: "foreign", label: "Foreign natural interest rate", variable: "instar", transform: "level", unit: "percent" },
  { id: "tbstar", group: "foreign", label: "Foreign trade balance", variable: "tbstar", transform: "level", unit: "percent" },
  { id: "totstar", group: "foreign", label: "Foreign terms of trade and real exchange rate", variable: "totstar", secondaryVariable: "rsstar", transform: "level", unit: "percent deviation from steady state", note: "Solid: terms of trade. Dashed: real exchange rate." },
  { id: "a", group: "shock", label: "Home productivity shock process", variable: "a", transform: "level", unit: "percent deviation from steady state", shockKind: "productivity" },
  { id: "astar", group: "shock", label: "Foreign productivity shock process", variable: "astar", transform: "level", unit: "percent deviation from steady state", shockKind: "productivity" },
  { id: "m", group: "shock", label: "Home monetary shock process", variable: "m", transform: "level", unit: "percent", shockKind: "monetary" },
  { id: "mstar", group: "shock", label: "Foreign monetary shock process", variable: "mstar", transform: "level", unit: "percent", shockKind: "monetary" }
];

export function cloneParams(params) {
  return JSON.parse(JSON.stringify(params));
}

export function getXistar(params) {
  return params.n * (1 - params.xi) / (1 - params.n);
}

function composite(p) {
  const xistar = getXistar(p);
  const eta = (p.n * p.xi) / (p.n * p.xi + (1 - p.n) * xistar);
  const etastar = (p.n * (1 - p.xi)) / (p.n * (1 - p.xi) + (1 - p.n) * (1 - xistar));
  const D = p.sig - (p.sig - (1 / p.gam)) * (p.xi - xistar) * (eta - etastar);
  const AH = p.sig * (eta * (1 - p.xi) + (1 - eta) * (1 - xistar)) -
    (1 - eta) * (p.xi - xistar) / p.gam;
  const AF = -p.sig * (etastar * p.xi + (1 - etastar) * xistar) -
    (1 - etastar) * (p.xi - xistar) / p.gam;
  const chi = (p.xi - xistar) / p.gam;
  const kappa = ((1 - p.alpha) * (1 - p.beta * p.alpha)) / p.alpha;

  return {
    xistar, eta, etastar, D, AH, AF, chi, kappa,
    Psi1: p.xi * p.vphi + p.gam * (p.sig * p.xi - (p.sig - (1 / p.gam)) * (p.xi - xistar) * (1 - etastar)) / D,
    Psi2: (1 - p.xi) * p.vphi + p.gam * (p.sig * (1 - p.xi) + (p.sig - (1 / p.gam)) * (p.xi - xistar) * (1 - eta)) / D,
    Psi1star: xistar * p.vphi +
      p.gam * (p.sig * xistar + (p.sig - (1 / p.gam)) * (p.xi - xistar) * etastar -
      (1 - (1 / p.gam)) * xistar * (p.xi - xistar)) / D,
    Psi2star: (1 - xistar) * p.vphi +
      p.gam * (p.sig * (1 - xistar) - (p.sig - (1 / p.gam)) * (p.xi - xistar) * eta +
      (1 - (1 / p.gam)) * xistar * (p.xi - xistar)) / D,
    ThetaTot: (1 + p.vphi) / (1 + p.vphi * D),
    OmegaRS: p.xi - xistar,
    omegaTB: (1 - p.n) * xistar,
    OmegaTB: p.sig - 1 + (p.sig - (1 / p.gam)) * (p.xi - xistar),
    LambdaXi: (AH + chi) / chi,
    LambdaXistar: AH / chi,
    LambdaXstarI: -(AF + chi) / chi,
    LambdaXstarIstar: -AF / chi,
    LambdaCa: (1 + p.vphi) / (p.gam + p.vphi) -
      ((p.vphi * AH + (1 - p.xi)) / (p.gam + p.vphi)) * ((1 + p.vphi) / (1 + p.vphi * D)),
    LambdaCastar: ((p.vphi * AH + (1 - p.xi)) / (p.gam + p.vphi)) * ((1 + p.vphi) / (1 + p.vphi * D))
  };
}

function completeComposite(p) {
  const c = composite(p);
  c.LambdaCstara = c.LambdaCa - ((p.xi - c.xistar) / p.gam) * c.ThetaTot;
  c.LambdaCstarastar = c.LambdaCastar + ((p.xi - c.xistar) / p.gam) * c.ThetaTot;
  c.LambdaYa = c.LambdaCa + c.AH * c.ThetaTot;
  c.LambdaYastar = c.LambdaCastar - c.AH * c.ThetaTot;
  c.LambdaYstara = c.LambdaCa + c.AF * c.ThetaTot;
  c.LambdaYstarastar = c.LambdaCastar - c.AF * c.ThetaTot;
  c.NaturalIa = p.gam * c.LambdaCa * (p.deltaa - 1);
  c.NaturalIastar = p.gam * c.LambdaCastar * (p.deltaastar - 1);
  c.NaturalIstara = p.gam * c.LambdaCstara * (p.deltaa - 1);
  c.NaturalIstarastar = p.gam * c.LambdaCstarastar * (p.deltaastar - 1);
  return c;
}

export function validateParams(p) {
  const messages = [];
  const warnings = [];
  if (!(p.n > 0 && p.n < 1)) messages.push("n must be between 0 and 1.");
  if (!(p.xi > 0 && p.xi < 1)) messages.push("xi must be between 0 and 1.");
  const xistar = getXistar(p);
  if (!Number.isFinite(xistar) || xistar < 0 || xistar > 1) {
    messages.push("The zero-trade-balance restriction implies xi* outside [0, 1].");
  }
  if (p.xi < p.n) messages.push("Home bias requires xi to be at least as large as n under zero steady-state trade balance.");
  if (p.xi <= xistar) warnings.push("The selected values do not display home bias (xi should exceed xi*).");
  if (p.phi_pi <= 1) warnings.push("The Home inflation response is at or below one; this may violate the usual Taylor-principle intuition.");
  if (p.phi_pistar <= 1) warnings.push("The Foreign inflation response is at or below one; this may violate the usual Taylor-principle intuition.");
  const c = completeComposite(p);
  for (const [key, value] of Object.entries(c)) {
    if (!Number.isFinite(value)) messages.push(`Composite coefficient ${key} is not finite.`);
  }
  if (Math.abs(c.chi) < 1e-8) messages.push("xi is too close to xi*, which makes the current reduced system ill-conditioned.");
  return { ok: messages.length === 0, messages, warnings, xistar, composite: c };
}

function zeroBlock() {
  return Array.from({ length: NVAR }, () => Array(NVAR).fill(0));
}

function add(block, row, name, value) {
  block[row][IDX[name]] += value;
}

function buildBlocks(p, c) {
  const L = zeroBlock();
  const C = zeroBlock();
  const U = zeroBlock();
  const iota = Number(p.iota || 0);
  const iotastar = Number(p.iotastar || 0);

  add(U, 0, "x", p.gam);
  add(C, 0, "x", -p.gam);
  add(C, 0, "i", -c.LambdaXi);
  add(C, 0, "in", c.LambdaXi);
  add(U, 0, "pi", c.LambdaXi);
  add(C, 0, "istar", c.LambdaXistar);
  add(C, 0, "instar", -c.LambdaXistar);
  add(U, 0, "pistar", -c.LambdaXistar);

  add(C, 1, "pi", 1);
  add(U, 1, "pi", -p.beta);
  add(C, 1, "x", -c.kappa * c.Psi1);
  add(C, 1, "xstar", -c.kappa * c.Psi2);

  add(C, 2, "i", 1);
  add(L, 2, "i", -p.rho_i);
  add(C, 2, "pi", -(1 - p.rho_i) * p.phi_pi);
  add(C, 2, "x", -(1 - p.rho_i) * p.phi_x);
  add(C, 2, "in", -(1 - p.rho_i) * iota);

  add(C, 3, "in", 1);
  add(C, 3, "a", -c.NaturalIa);
  add(C, 3, "astar", -c.NaturalIastar);

  add(U, 4, "xstar", p.gam);
  add(C, 4, "xstar", -p.gam);
  add(C, 4, "i", c.LambdaXstarI);
  add(C, 4, "in", -c.LambdaXstarI);
  add(U, 4, "pi", -c.LambdaXstarI);
  add(C, 4, "istar", -c.LambdaXstarIstar);
  add(C, 4, "instar", c.LambdaXstarIstar);
  add(U, 4, "pistar", c.LambdaXstarIstar);

  add(C, 5, "pistar", 1);
  add(U, 5, "pistar", -p.beta);
  add(C, 5, "x", -c.kappa * c.Psi1star);
  add(C, 5, "xstar", -c.kappa * c.Psi2star);

  add(C, 6, "istar", 1);
  add(L, 6, "istar", -p.rho_istar);
  add(C, 6, "pistar", -(1 - p.rho_istar) * p.phi_pistar);
  add(C, 6, "xstar", -(1 - p.rho_istar) * p.phi_xstar);
  add(C, 6, "instar", -(1 - p.rho_istar) * iotastar);

  add(C, 7, "instar", 1);
  add(C, 7, "a", -c.NaturalIstara);
  add(C, 7, "astar", -c.NaturalIstarastar);

  add(C, 8, "y", 1);
  add(C, 8, "x", -1);
  add(C, 8, "a", -c.LambdaYa);
  add(C, 8, "astar", -c.LambdaYastar);

  add(C, 9, "ystar", 1);
  add(C, 9, "xstar", -1);
  add(C, 9, "a", -c.LambdaYstara);
  add(C, 9, "astar", -c.LambdaYstarastar);

  add(C, 10, "pil1", 1);
  add(L, 10, "pi", -1);

  add(C, 11, "a", 1);
  add(L, 11, "a", -p.deltaa);

  add(C, 12, "astar", 1);
  add(L, 12, "astar", -p.deltaastar);

  add(C, 13, "m", 1);
  add(L, 13, "m", -p.deltam);

  add(C, 14, "mstar", 1);
  add(L, 14, "mstar", -p.deltamstar);

  return { L, C, U };
}

function shockVector(p, shock) {
  const eps = { eps_a: 0, eps_astar: 0, eps_m: 0, eps_mstar: 0 };
  const sign = shock.sign === "negative" ? -1 : 1;
  const scale = Number(shock.scale || 1);
  if (shock.type === "eps_a") eps.eps_a = sign * scale * p.stda;
  if (shock.type === "eps_astar") eps.eps_astar = sign * scale * p.stdastar;
  if (shock.type === "eps_m") eps.eps_m = sign * scale * p.stdm;
  if (shock.type === "eps_mstar") eps.eps_mstar = sign * scale * p.stdmstar;
  return eps;
}

function rhsForPeriod(eps, t) {
  const d = Array(NVAR).fill(0);
  if (t === 0) {
    d[2] = eps.eps_m;
    d[6] = eps.eps_mstar;
    d[11] = eps.eps_a;
    d[12] = eps.eps_astar;
    d[13] = eps.eps_m;
    d[14] = eps.eps_mstar;
  }
  return d;
}

function matClone(A) {
  return A.map(row => row.slice());
}

function matSub(A, B) {
  return A.map((row, i) => row.map((v, j) => v - B[i][j]));
}

function matMul(A, B) {
  const rows = A.length;
  const inner = B.length;
  const cols = Array.isArray(B[0]) ? B[0].length : 1;
  const out = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const aik = A[i][k];
      if (aik === 0) continue;
      if (cols === 1) out[i][0] += aik * B[k];
      else for (let j = 0; j < cols; j++) out[i][j] += aik * B[k][j];
    }
  }
  return cols === 1 ? out.map(row => row[0]) : out;
}

function vecSub(a, b) {
  return a.map((v, i) => v - b[i]);
}

function solveSmall(Ainput, Binput) {
  const A = matClone(Ainput);
  const isVector = !Array.isArray(Binput[0]);
  const B = isVector ? Binput.map(v => [v]) : matClone(Binput);
  const n = A.length;
  const m = B[0].length;

  for (let col = 0; col < n; col++) {
    let pivot = col;
    let maxAbs = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      const val = Math.abs(A[r][col]);
      if (val > maxAbs) {
        maxAbs = val;
        pivot = r;
      }
    }
    if (maxAbs < 1e-12) throw new Error("The model system is singular or too close to singular for this parameterization.");
    if (pivot !== col) {
      [A[col], A[pivot]] = [A[pivot], A[col]];
      [B[col], B[pivot]] = [B[pivot], B[col]];
    }
    const diag = A[col][col];
    for (let j = col; j < n; j++) A[col][j] /= diag;
    for (let j = 0; j < m; j++) B[col][j] /= diag;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      if (factor === 0) continue;
      for (let j = col; j < n; j++) A[r][j] -= factor * A[col][j];
      for (let j = 0; j < m; j++) B[r][j] -= factor * B[col][j];
    }
  }
  return isVector ? B.map(row => row[0]) : B;
}

function solveBlockTridiagonal(L, C, U, rhs) {
  const horizon = rhs.length;
  const cp = new Array(horizon);
  const dp = new Array(horizon);
  cp[0] = solveSmall(C, U);
  dp[0] = solveSmall(C, rhs[0]);
  for (let t = 1; t < horizon; t++) {
    const denom = matSub(C, matMul(L, cp[t - 1]));
    const adjusted = vecSub(rhs[t], matMul(L, dp[t - 1]));
    cp[t] = t === horizon - 1 ? zeroBlock() : solveSmall(denom, U);
    dp[t] = solveSmall(denom, adjusted);
  }
  const x = new Array(horizon);
  x[horizon - 1] = dp[horizon - 1];
  for (let t = horizon - 2; t >= 0; t--) {
    x[t] = vecSub(dp[t], matMul(cp[t], x[t + 1]));
  }
  return x;
}

export function solveModel(params, shock, horizon = 40) {
  const validation = validateParams(params);
  if (!validation.ok) throw new Error(validation.messages.join(" "));
  const c = validation.composite;
  const blocks = buildBlocks(params, c);
  const eps = shockVector(params, shock);
  const rhs = Array.from({ length: horizon }, (_, t) => rhsForPeriod(eps, t));
  const solution = solveBlockTridiagonal(blocks.L, blocks.C, blocks.U, rhs);
  const maxAbs = Math.max(...solution.flat().map(value => Math.abs(value)));
  if (!Number.isFinite(maxAbs)) {
    throw new Error("The model solution contains non-finite values for this parameterization.");
  }
  if (maxAbs > 1e6) {
    throw new Error("The model solution is numerically explosive for this parameterization.");
  }
  const rows = solution.map((values, t) => {
    const row = { period: t };
    VARS.forEach((name, i) => { row[name] = values[i]; });
    row.growth = t === 0 ? row.y : row.y - solution[t - 1][IDX.y];
    row.growthStar = t === 0 ? row.ystar : row.ystar - solution[t - 1][IDX.ystar];
    row.employment = row.y - row.a;
    row.employmentStar = row.ystar - row.astar;
    row.totbar = c.ThetaTot * (row.a - row.astar);
    row.tot = row.totbar + (row.x - row.xstar) / c.D;
    row.totstar = -row.tot;
    row.rsbar = c.OmegaRS * row.totbar;
    row.rs = c.OmegaRS * row.tot;
    row.rsstar = -row.rs;
    row.tb = c.omegaTB * c.OmegaTB * row.tot;
    row.tbstar = -row.tb;
    return row;
  });
  return {
    rows,
    xistar: validation.xistar,
    composite: c,
    shockInnovation: eps
  };
}
