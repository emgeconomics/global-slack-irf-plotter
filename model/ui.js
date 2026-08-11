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
    title: "Productivity and monetary shocks",
    help: "Innovation standard deviations, persistence, and within-family cross-country correlations.",
    params: [
      ["deltaa", "Home productivity persistence", 0, 0.999, 0.001],
      ["deltaastar", "Foreign productivity persistence", 0, 0.999, 0.001],
      ["stda", "Home productivity std. dev.", 0, 5, 0.001],
      ["stdastar", "Foreign productivity std. dev.", 0, 5, 0.001],
      ["corraastar", "Productivity innovation correlation", -0.99, 0.99, 0.01],
      ["deltam", "Home monetary persistence", 0, 0.999, 0.001],
      ["deltamstar", "Foreign monetary persistence", 0, 0.999, 0.001],
      ["stdm", "Home monetary std. dev.", 0, 5, 0.001],
      ["stdmstar", "Foreign monetary std. dev.", 0, 5, 0.001],
      ["corrmmstar", "Monetary innovation correlation", -0.99, 0.99, 0.01]
    ]
  },
  {
    title: "Markup and aggregate-demand shocks",
    help: "Provisional extension parameters pending the DGEI-based SMM exercise.",
    params: [
      ["deltamu", "Home markup persistence", 0, 0.999, 0.001],
      ["deltamustar", "Foreign markup persistence", 0, 0.999, 0.001],
      ["stdmu", "Home markup std. dev.", 0, 5, 0.001],
      ["stdmustar", "Foreign markup std. dev.", 0, 5, 0.001],
      ["corrmumustar", "Markup innovation correlation", -0.99, 0.99, 0.01],
      ["deltad", "Home demand persistence", 0, 0.999, 0.001],
      ["deltadstar", "Foreign demand persistence", 0, 0.999, 0.001],
      ["stdd", "Home demand std. dev.", 0, 5, 0.001],
      ["stddstar", "Foreign demand std. dev.", 0, 5, 0.001],
      ["corrddstar", "Demand innovation correlation", -0.99, 0.99, 0.01]
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
  { id: "tot", group: "home", label: "Home terms of trade and real exchange rate", variable: "tot", secondaryVariable: "rs", transform: "level", unit: "percent deviation from steady state", note: "Solid: terms of trade, up = deterioration. Dashed: real exchange rate, up = real depreciation." },
  { id: "pistar", group: "foreign", label: "Foreign inflation", variable: "pistar", transform: "level", unit: "percent" },
  { id: "employmentStar", group: "foreign", label: "Foreign employment", variable: "employmentStar", transform: "level", unit: "percent deviation from steady state" },
  { id: "ystar", group: "foreign", label: "Foreign output", variable: "ystar", transform: "level", unit: "percent deviation from steady state" },
  { id: "growthStar", group: "foreign", label: "Foreign output growth", variable: "ystar", transform: "diff", unit: "percent log difference" },
  { id: "istar", group: "foreign", label: "Foreign interest rate", variable: "istar", transform: "level", unit: "percent" },
  { id: "instar", group: "foreign", label: "Foreign natural interest rate", variable: "instar", transform: "level", unit: "percent" },
  { id: "tbstar", group: "foreign", label: "Foreign trade balance", variable: "tbstar", transform: "level", unit: "percent" },
  { id: "totstar", group: "foreign", label: "Foreign terms of trade and real exchange rate", variable: "totstar", secondaryVariable: "rsstar", transform: "level", unit: "percent deviation from steady state", note: "Solid: terms of trade, up = deterioration. Dashed: real exchange rate, up = real depreciation." },
  { id: "a", group: "shock", label: "Home productivity shock process", variable: "a", transform: "level", unit: "percent deviation from steady state", shockKind: "productivity" },
  { id: "astar", group: "shock", label: "Foreign productivity shock process", variable: "astar", transform: "level", unit: "percent deviation from steady state", shockKind: "productivity" },
  { id: "m", group: "shock", label: "Home monetary shock process", variable: "m", transform: "level", unit: "percent", shockKind: "monetary" },
  { id: "mstar", group: "shock", label: "Foreign monetary shock process", variable: "mstar", transform: "level", unit: "percent", shockKind: "monetary" },
  { id: "mu", group: "shock", label: "Home markup shock process", variable: "mu", transform: "level", unit: "cost-pressure wedge", shockKind: "markup" },
  { id: "mustar", group: "shock", label: "Foreign markup shock process", variable: "mustar", transform: "level", unit: "cost-pressure wedge", shockKind: "markup" },
  { id: "d", group: "shock", label: "Home aggregate-demand shock process", variable: "d", transform: "level", unit: "output-gap units", shockKind: "demand" },
  { id: "dstar", group: "shock", label: "Foreign aggregate-demand shock process", variable: "dstar", transform: "level", unit: "output-gap units", shockKind: "demand" }
];
