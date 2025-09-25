import logger from "../plugins/winston";

function roundToDecimals(number: number, decimals: number) {
  logger.debug(`Rounding number ${number} to ${decimals} decimals`);
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
}

module.exports = roundToDecimals;
