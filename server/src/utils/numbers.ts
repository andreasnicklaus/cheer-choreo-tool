function roundToDecimals(number: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
}

module.exports = roundToDecimals;
