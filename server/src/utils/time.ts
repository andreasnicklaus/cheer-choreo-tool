import logger from "../plugins/winston";

const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = 60 * MILLIS_PER_SECOND;
const MILLIS_PER_HOUR = 60 * MILLIS_PER_MINUTE;
const MILLIS_PER_DAY = 24 * MILLIS_PER_HOUR;

export function timeStringToMillis(timeString: string) {
  let result = 0;
  Array.from(timeString
    .matchAll(/(\d{1,3})s/g))
    .forEach((match: string[]) => (result += parseInt(match[1]) * MILLIS_PER_SECOND));
  Array.from(timeString
    .matchAll(/(\d{1,3})m/g))
    .forEach((match: string[]) => (result += parseInt(match[1]) * MILLIS_PER_MINUTE));
  Array.from(timeString
    .matchAll(/(\d{1,3})h/g))
    .forEach((match: string[]) => (result += parseInt(match[1]) * MILLIS_PER_HOUR));
  Array.from(timeString
    .matchAll(/(\d{1,3})d/g))
    .forEach((match: string[]) => (result += parseInt(match[1]) * MILLIS_PER_DAY));
  logger.debug(`Converted time ${timeString} to ${result}`)
  return result;
}
