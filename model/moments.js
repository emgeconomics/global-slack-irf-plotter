export const MOMENT_IDS = Object.freeze([
  "sd_g_y_us", "ar1_g_y_us",
  "sd_g_y_row", "ar1_g_y_row",
  "sd_pi_us", "ar1_pi_us",
  "sd_pi_row", "ar1_pi_row",
  "sd_i_us", "ar1_i_us",
  "sd_i_row", "ar1_i_row",
  "corr_g_us_row", "corr_pi_us_row", "corr_i_us_row",
  "corr_pi_g_us", "corr_i_pi_us", "corr_i_g_us",
  "corr_pi_g_row", "corr_i_pi_row", "corr_i_g_row",
  "corr_i_pi_lag_us", "corr_i_g_lag_us",
  "corr_i_pi_lag_row", "corr_i_g_lag_row",
  "corr_pi_us_g_row", "corr_pi_row_g_us"
]);

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleStandardDeviation(values) {
  if (values.length < 2) throw new Error("At least two observations are required for a standard deviation.");
  const average = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
}

function correlation(left, right) {
  if (left.length !== right.length || left.length < 2) {
    throw new Error("Correlation vectors must have the same length and at least two observations.");
  }
  const leftMean = mean(left);
  const rightMean = mean(right);
  let numerator = 0;
  let leftSum = 0;
  let rightSum = 0;
  for (let i = 0; i < left.length; i++) {
    const leftDeviation = left[i] - leftMean;
    const rightDeviation = right[i] - rightMean;
    numerator += leftDeviation * rightDeviation;
    leftSum += leftDeviation ** 2;
    rightSum += rightDeviation ** 2;
  }
  const denominator = Math.sqrt(leftSum * rightSum);
  if (!(denominator > 0)) throw new Error("Correlation is undefined for a constant series.");
  return numerator / denominator;
}

function extractObservables(rows) {
  if (!Array.isArray(rows) || rows.length < 3) throw new Error("At least three rows are required to compute moments.");
  return rows.map((row, index) => {
    const observable = {
      g_y_us: Number(row.g_y_us ?? row.growth),
      g_y_row: Number(row.g_y_row ?? row.growthStar),
      pi_us: Number(row.pi_us ?? row.pi),
      pi_row: Number(row.pi_row ?? row.pistar),
      i_us: Number(row.i_us ?? row.i),
      i_row: Number(row.i_row ?? row.istar)
    };
    for (const [key, value] of Object.entries(observable)) {
      if (!Number.isFinite(value)) throw new Error(`Observation ${index} has a non-finite value for ${key}.`);
    }
    return observable;
  });
}

function series(rows, key) {
  return rows.map(row => row[key]);
}

function laggedCorrelation(rows, currentKey, laggedKey) {
  return correlation(series(rows.slice(1), currentKey), series(rows.slice(0, -1), laggedKey));
}

export function computeMomentVector(inputRows) {
  const rows = extractObservables(inputRows);
  const gUs = series(rows, "g_y_us");
  const gRow = series(rows, "g_y_row");
  const piUs = series(rows, "pi_us");
  const piRow = series(rows, "pi_row");
  const iUs = series(rows, "i_us");
  const iRow = series(rows, "i_row");

  const values = [
    sampleStandardDeviation(gUs), laggedCorrelation(rows, "g_y_us", "g_y_us"),
    sampleStandardDeviation(gRow), laggedCorrelation(rows, "g_y_row", "g_y_row"),
    sampleStandardDeviation(piUs), laggedCorrelation(rows, "pi_us", "pi_us"),
    sampleStandardDeviation(piRow), laggedCorrelation(rows, "pi_row", "pi_row"),
    sampleStandardDeviation(iUs), laggedCorrelation(rows, "i_us", "i_us"),
    sampleStandardDeviation(iRow), laggedCorrelation(rows, "i_row", "i_row"),
    correlation(gUs, gRow), correlation(piUs, piRow), correlation(iUs, iRow),
    correlation(piUs, gUs), correlation(iUs, piUs), correlation(iUs, gUs),
    correlation(piRow, gRow), correlation(iRow, piRow), correlation(iRow, gRow),
    laggedCorrelation(rows, "i_us", "pi_us"), laggedCorrelation(rows, "i_us", "g_y_us"),
    laggedCorrelation(rows, "i_row", "pi_row"), laggedCorrelation(rows, "i_row", "g_y_row"),
    correlation(piUs, gRow), correlation(piRow, gUs)
  ];

  const byId = Object.fromEntries(MOMENT_IDS.map((id, index) => [id, values[index]]));
  return { ids: MOMENT_IDS.slice(), values, byId, observations: rows.length };
}
