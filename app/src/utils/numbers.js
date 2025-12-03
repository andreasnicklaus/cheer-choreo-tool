const { debug } = require("./logging");

export function roundToDecimals(number, decimals) {
  debug(`Rounding number ${number} to ${decimals} decimals`);
  const factor = decimals == 0 ? 1 : 10 ** decimals;
  return Math.round(number * factor) / factor;
}
