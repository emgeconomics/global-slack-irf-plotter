import { getXistar } from "./parameters.js";

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
    closedEconomySlope: kappa * (p.gam + p.vphi),
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

function validateRange(messages, value, condition, message) {
  if (!condition(value)) messages.push(message);
}

export function validateParams(p) {
  const messages = [];
  const warnings = [];
  validateRange(messages, p.beta, value => value > 0 && value < 1, "beta must be between 0 and 1.");
  validateRange(messages, p.n, value => value > 0 && value < 1, "n must be between 0 and 1.");
  validateRange(messages, p.xi, value => value > 0 && value < 1, "xi must be between 0 and 1.");
  for (const key of ["gam", "vphi", "sig"]) {
    validateRange(messages, p[key], value => value > 0, `${key} must be positive.`);
  }
  validateRange(messages, p.alpha, value => value > 0 && value < 1, "alpha must be between 0 and 1.");

  const persistenceKeys = ["rho_i", "rho_istar", "deltaa", "deltaastar", "deltam", "deltamstar", "deltamu", "deltamustar", "deltad", "deltadstar"];
  for (const key of persistenceKeys) {
    validateRange(messages, p[key], value => Number.isFinite(value) && value >= 0 && value < 1, `${key} must be in [0,1).`);
  }
  const stdKeys = ["stda", "stdastar", "stdm", "stdmstar", "stdmu", "stdmustar", "stdd", "stddstar"];
  for (const key of stdKeys) {
    validateRange(messages, p[key], value => Number.isFinite(value) && value >= 0, `${key} must be nonnegative.`);
  }
  const correlationKeys = ["corraastar", "corrmmstar", "corrmumustar", "corrddstar"];
  for (const key of correlationKeys) {
    validateRange(messages, p[key], value => Number.isFinite(value) && value > -1 && value < 1, `${key} must be strictly between -1 and 1.`);
  }

  const xistar = getXistar(p);
  if (!Number.isFinite(xistar) || xistar < 0 || xistar > 1) {
    messages.push("The zero-trade-balance restriction implies xi* outside [0, 1].");
  }
  if (p.xi < p.n) messages.push("Home bias requires xi to be at least as large as n under zero steady-state trade balance.");
  if (p.xi <= xistar) warnings.push("The selected values do not display home bias (xi should exceed xi*).");
  if (p.phi_pi <= 1) warnings.push("The Home inflation response is at or below one; this may violate the usual Taylor-principle intuition.");
  if (p.phi_pistar <= 1) warnings.push("The Foreign inflation response is at or below one; this may violate the usual Taylor-principle intuition.");

  let c = null;
  if (messages.length === 0) {
    c = completeComposite(p);
    for (const [key, value] of Object.entries(c)) {
      if (!Number.isFinite(value)) messages.push(`Composite coefficient ${key} is not finite.`);
    }
    if (Math.abs(c.chi) < 1e-8) messages.push("xi is too close to xi*, which makes the current reduced system ill-conditioned.");
    if (!(c.D > 0)) messages.push("The terms-of-trade denominator D must be positive.");
  }
  return { ok: messages.length === 0, messages, warnings, xistar, composite: c };
}
