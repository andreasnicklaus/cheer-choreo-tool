const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = 60 * MILLIS_PER_SECOND;
const MILLIS_PER_HOUR = 60 * MILLIS_PER_MINUTE;
const MILLIS_PER_DAY = 24 * MILLIS_PER_HOUR;

export function timeStringToMillis(timeString) {
  let result = 0;
  timeString
    .matchAll(/(\d{1,3})s/g)
    .forEach((match) => (result += parseInt(match[1]) * MILLIS_PER_SECOND));
  timeString
    .matchAll(/(\d{1,3})m/g)
    .forEach((match) => (result += parseInt(match[1]) * MILLIS_PER_MINUTE));
  timeString
    .matchAll(/(\d{1,3})h/g)
    .forEach((match) => (result += parseInt(match[1]) * MILLIS_PER_HOUR));
  timeString
    .matchAll(/(\d{1,3})d/g)
    .forEach((match) => (result += parseInt(match[1]) * MILLIS_PER_DAY));
  return parseInt(result);
}
