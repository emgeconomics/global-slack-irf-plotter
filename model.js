export {
  PAPER_PARAMS,
  cloneParams,
  getXistar,
  getClosedEconomySlope,
  alphaFromClosedEconomySlope
} from "./model/parameters.js";

export { PARAM_GROUPS, SERIES } from "./model/ui.js";
export { validateParams } from "./model/composites.js";
export { solveModel } from "./model/system.js";

// The revision UI is browser-only. Keeping the dynamic import here means the
// existing static page acquires the new shock selectors without coupling the
// numerical model to DOM code or breaking Node-based tests.
if (typeof document !== "undefined") {
  import("./revision-ui.js").catch(error => {
    console.error("Unable to load the round-two extension controls.", error);
  });
}
