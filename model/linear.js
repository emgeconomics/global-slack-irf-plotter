import { NVAR } from "./parameters.js";

export function zeroBlock() {
  return Array.from({ length: NVAR }, () => Array(NVAR).fill(0));
}

function matClone(A) {
  return A.map(row => row.slice());
}

function matSub(A, B) {
  return A.map((row, i) => row.map((value, j) => value - B[i][j]));
}

function matMul(A, B) {
  const rows = A.length;
  const inner = B.length;
  const cols = Array.isArray(B[0]) ? B[0].length : 1;
  const out = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const value = A[i][k];
      if (value === 0) continue;
      if (cols === 1) out[i][0] += value * B[k];
      else for (let j = 0; j < cols; j++) out[i][j] += value * B[k][j];
    }
  }
  return cols === 1 ? out.map(row => row[0]) : out;
}

function vecSub(a, b) {
  return a.map((value, i) => value - b[i]);
}

function solveSmall(Ainput, Binput) {
  const A = matClone(Ainput);
  const isVector = !Array.isArray(Binput[0]);
  const B = isVector ? Binput.map(value => [value]) : matClone(Binput);
  const n = A.length;
  const m = B[0].length;

  for (let col = 0; col < n; col++) {
    let pivot = col;
    let maxAbs = Math.abs(A[col][col]);
    for (let row = col + 1; row < n; row++) {
      const value = Math.abs(A[row][col]);
      if (value > maxAbs) {
        maxAbs = value;
        pivot = row;
      }
    }
    if (maxAbs < 1e-12) throw new Error("The model system is singular or too close to singular for this parameterization.");
    if (pivot !== col) {
      [A[col], A[pivot]] = [A[pivot], A[col]];
      [B[col], B[pivot]] = [B[pivot], B[col]];
    }
    const diagonal = A[col][col];
    for (let j = col; j < n; j++) A[col][j] /= diagonal;
    for (let j = 0; j < m; j++) B[col][j] /= diagonal;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = A[row][col];
      if (factor === 0) continue;
      for (let j = col; j < n; j++) A[row][j] -= factor * A[col][j];
      for (let j = 0; j < m; j++) B[row][j] -= factor * B[col][j];
    }
  }
  return isVector ? B.map(row => row[0]) : B;
}

export function solveBlockTridiagonal(L, C, U, rhs) {
  const horizon = rhs.length;
  const cp = new Array(horizon);
  const dp = new Array(horizon);
  cp[0] = solveSmall(C, U);
  dp[0] = solveSmall(C, rhs[0]);
  for (let t = 1; t < horizon; t++) {
    const denominator = matSub(C, matMul(L, cp[t - 1]));
    const adjusted = vecSub(rhs[t], matMul(L, dp[t - 1]));
    cp[t] = t === horizon - 1 ? zeroBlock() : solveSmall(denominator, U);
    dp[t] = solveSmall(denominator, adjusted);
  }
  const solution = new Array(horizon);
  solution[horizon - 1] = dp[horizon - 1];
  for (let t = horizon - 2; t >= 0; t--) {
    solution[t] = vecSub(dp[t], matMul(cp[t], solution[t + 1]));
  }
  return solution;
}
