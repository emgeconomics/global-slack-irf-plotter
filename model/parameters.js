export const VARS = [
  "a", "astar", "y", "ystar", "i", "istar", "m", "mstar",
  "mu", "mustar", "d", "dstar",
  "pi", "pistar", "pil1", "in", "instar", "x", "xstar"
];

export const IDX = Object.fromEntries(VARS.map((name, i) => [name, i]));
export const NVAR = VARS.length;

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
  corrmmstar: 0.5,
  // Provisional extension defaults. These will be replaced by the SMM results.
  deltamu: 0.5,
  deltamustar: 0.5,
  stdmu: 0.1,
  stdmustar: 0.1,
  corrmumustar: 0,
  deltad: 0.5,
  deltadstar: 0.5,
  stdd: 0.1,
  stddstar: 0.1,
  corrddstar: 0
});

export function cloneParams(params) {
  return JSON.parse(JSON.stringify(params));
}

export function getXistar(params) {
  return params.n * (1 - params.xi) / (1 - params.n);
}

export function getClosedEconomySlope(params) {
  const phi = ((1 - params.alpha) * (1 - params.beta * params.alpha)) / params.alpha;
  return phi * (params.gam + params.vphi);
}

export function alphaFromClosedEconomySlope(kappaClosed, beta, gam, vphi) {
  if (!(kappaClosed > 0) || !(beta > 0 && beta < 1) || !(gam > 0) || !(vphi > 0)) {
    throw new Error("The slope mapping requires kappaClosed > 0, beta in (0,1), and positive curvature parameters.");
  }
  const q = kappaClosed / (gam + vphi);
  const b = -(1 + beta + q);
  const discriminant = b * b - 4 * beta;
  if (!(discriminant >= 0)) throw new Error("The requested slope does not imply a real Calvo parameter.");
  const roots = [(-b - Math.sqrt(discriminant)) / (2 * beta), (-b + Math.sqrt(discriminant)) / (2 * beta)];
  const admissible = roots.filter(root => root > 0 && root < 1);
  if (admissible.length !== 1) throw new Error("The requested slope does not imply a unique Calvo parameter in (0,1).");
  return admissible[0];
}
