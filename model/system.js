import { VARS, IDX, NVAR } from "./parameters.js";
import { validateParams } from "./composites.js";
import { zeroBlock, solveBlockTridiagonal } from "./linear.js";

function add(block, row, name, value) {
  block[row][IDX[name]] += value;
}

function buildBlocks(p, c) {
  const L = zeroBlock();
  const C = zeroBlock();
  const U = zeroBlock();
  const iota = Number(p.iota || 0);
  const iotastar = Number(p.iotastar || 0);

  // Home IS curve. Code states d and dstar map to the manuscript Euler
  // wedges zeta_t and zeta*_t, measured in real-rate-equivalent units.
  // They enter by shifting the Home and Foreign real-rate gaps before the
  // open-economy Lambda_x mapping is applied.
  add(U, 0, "x", p.gam);
  add(C, 0, "x", -p.gam);
  add(C, 0, "i", -c.LambdaXi);
  add(C, 0, "in", c.LambdaXi);
  add(U, 0, "pi", c.LambdaXi);
  add(C, 0, "istar", c.LambdaXistar);
  add(C, 0, "instar", -c.LambdaXistar);
  add(U, 0, "pistar", -c.LambdaXistar);
  add(C, 0, "d", c.LambdaXi);
  add(C, 0, "dstar", -c.LambdaXistar);

  // Home CPI Phillips curve. Markup wedges are producer-origin shocks.
  add(C, 1, "pi", 1);
  add(U, 1, "pi", -p.beta);
  add(C, 1, "x", -c.kappa * c.Psi1);
  add(C, 1, "xstar", -c.kappa * c.Psi2);
  add(C, 1, "mu", -c.kappa * p.xi);
  add(C, 1, "mustar", -c.kappa * (1 - p.xi));

  // Home Taylor rule. The monetary shock process now enters explicitly, so
  // nonzero monetary-shock persistence affects the policy instrument correctly.
  add(C, 2, "i", 1);
  add(L, 2, "i", -p.rho_i);
  add(C, 2, "pi", -(1 - p.rho_i) * p.phi_pi);
  add(C, 2, "x", -(1 - p.rho_i) * p.phi_x);
  add(C, 2, "in", -(1 - p.rho_i) * iota);
  add(C, 2, "m", -1);

  add(C, 3, "in", 1);
  add(C, 3, "a", -c.NaturalIa);
  add(C, 3, "astar", -c.NaturalIastar);

  // Foreign IS curve, with the same two Euler wedges passed through the
  // Foreign row of the open-economy Lambda_x mapping.
  add(U, 4, "xstar", p.gam);
  add(C, 4, "xstar", -p.gam);
  add(C, 4, "i", c.LambdaXstarI);
  add(C, 4, "in", -c.LambdaXstarI);
  add(U, 4, "pi", -c.LambdaXstarI);
  add(C, 4, "istar", -c.LambdaXstarIstar);
  add(C, 4, "instar", c.LambdaXstarIstar);
  add(U, 4, "pistar", c.LambdaXstarIstar);
  add(C, 4, "d", -c.LambdaXstarI);
  add(C, 4, "dstar", c.LambdaXstarIstar);

  // Foreign CPI Phillips curve.
  add(C, 5, "pistar", 1);
  add(U, 5, "pistar", -p.beta);
  add(C, 5, "x", -c.kappa * c.Psi1star);
  add(C, 5, "xstar", -c.kappa * c.Psi2star);
  add(C, 5, "mu", -c.kappa * c.xistar);
  add(C, 5, "mustar", -c.kappa * (1 - c.xistar));

  add(C, 6, "istar", 1);
  add(L, 6, "istar", -p.rho_istar);
  add(C, 6, "pistar", -(1 - p.rho_istar) * p.phi_pistar);
  add(C, 6, "xstar", -(1 - p.rho_istar) * p.phi_xstar);
  add(C, 6, "instar", -(1 - p.rho_istar) * iotastar);
  add(C, 6, "mstar", -1);

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

  add(C, 15, "mu", 1);
  add(L, 15, "mu", -p.deltamu);

  add(C, 16, "mustar", 1);
  add(L, 16, "mustar", -p.deltamustar);

  add(C, 17, "d", 1);
  add(L, 17, "d", -p.deltad);

  add(C, 18, "dstar", 1);
  add(L, 18, "dstar", -p.deltadstar);

  return { L, C, U };
}

function shockVector(p, shock) {
  const eps = {
    eps_a: 0,
    eps_astar: 0,
    eps_m: 0,
    eps_mstar: 0,
    eps_mu: 0,
    eps_mustar: 0,
    eps_d: 0,
    eps_dstar: 0
  };
  const sign = shock.sign === "negative" ? -1 : 1;
  const scale = Number(shock.scale || 1);
  const shockStd = {
    eps_a: p.stda,
    eps_astar: p.stdastar,
    eps_m: p.stdm,
    eps_mstar: p.stdmstar,
    eps_mu: p.stdmu,
    eps_mustar: p.stdmustar,
    eps_d: p.stdd,
    eps_dstar: p.stddstar
  };
  if (!(shock.type in shockStd)) throw new Error(`Unknown shock type: ${shock.type}`);
  eps[shock.type] = sign * scale * shockStd[shock.type];
  return eps;
}

function rhsForPeriod(eps, t) {
  const rhs = Array(NVAR).fill(0);
  if (t === 0) {
    rhs[11] = eps.eps_a;
    rhs[12] = eps.eps_astar;
    rhs[13] = eps.eps_m;
    rhs[14] = eps.eps_mstar;
    rhs[15] = eps.eps_mu;
    rhs[16] = eps.eps_mustar;
    rhs[17] = eps.eps_d;
    rhs[18] = eps.eps_dstar;
  }
  return rhs;
}

export function solveModel(params, shock, horizon = 40) {
  const validation = validateParams(params);
  if (!validation.ok) throw new Error(validation.messages.join(" "));
  if (!Number.isInteger(horizon) || horizon < 2) throw new Error("The solution horizon must be an integer of at least two periods.");

  const compositeValues = validation.composite;
  const blocks = buildBlocks(params, compositeValues);
  const eps = shockVector(params, shock);
  const rhs = Array.from({ length: horizon }, (_, t) => rhsForPeriod(eps, t));
  const solution = solveBlockTridiagonal(blocks.L, blocks.C, blocks.U, rhs);
  const maxAbs = Math.max(...solution.flat().map(value => Math.abs(value)));
  if (!Number.isFinite(maxAbs)) throw new Error("The model solution contains non-finite values for this parameterization.");
  if (maxAbs > 1e6) throw new Error("The model solution is numerically explosive for this parameterization.");

  const rows = solution.map((values, t) => {
    const row = { period: t };
    VARS.forEach((name, i) => { row[name] = values[i]; });
    row.growth = t === 0 ? row.y : row.y - solution[t - 1][IDX.y];
    row.growthStar = t === 0 ? row.ystar : row.ystar - solution[t - 1][IDX.ystar];
    row.employment = row.y - row.a;
    row.employmentStar = row.ystar - row.astar;
    row.totbar = compositeValues.ThetaTot * (row.a - row.astar);
    row.tot = row.totbar + (row.x - row.xstar) / compositeValues.D;
    row.totstar = -row.tot;
    row.rsbar = compositeValues.OmegaRS * row.totbar;
    row.rs = compositeValues.OmegaRS * row.tot;
    row.rsstar = -row.rs;
    row.tb = compositeValues.omegaTB * compositeValues.OmegaTB * row.tot;
    row.tbstar = -row.tb;
    return row;
  });

  return {
    rows,
    xistar: validation.xistar,
    composite: compositeValues,
    shockInnovation: eps
  };
}
