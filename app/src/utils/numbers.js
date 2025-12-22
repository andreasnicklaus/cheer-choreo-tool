const { debug } = require("./logging");

export function roundToDecimals(number, decimals) {
  debug(`Rounding number ${number} to ${decimals} decimals`);
  const factor = decimals == 0 ? 1 : 10 ** decimals;
  return Math.round(number * factor) / factor;
}

export function clamp(number, min, max, roundDecimals = null) {
  debug(`Clamping number ${number} to range [${min}, ${max}]`);
  if (roundDecimals !== null) {
    number = roundToDecimals(number, roundDecimals);
  }
  return Math.min(Math.max(number, min), max);
}
