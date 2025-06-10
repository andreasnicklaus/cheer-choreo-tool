import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import de from "javascript-time-ago/locale/de.json";
import i18n from "@/plugins/vue-i18n";
import { debug } from "./logging";

de.now.now.past = "vor einem Moment";

TimeAgo.addLocale(en);
TimeAgo.addLocale(de);

function initTimeAgo(locale) {
  return new TimeAgo(locale, { locale });
}

/**
 * Turn a date into a "time ago" string, e.g. "5 minutes ago", "2 days ago"
 * @global
 *
 * @param {Date} date - Date to format
 * @param {string} [locale=i18n.locale] - Locale to use for formatting
 * @returns {string} Formatted time ago string
 */
function toTimeAgo(date, locale = i18n.locale) {
  debug("Converting time to timeAgo", { date, locale });
  const timeAgo = initTimeAgo(locale);
  const result = timeAgo.format(new Date(date), "round-minute");
  debug("Converted time", { result });
  return result;
}

export default toTimeAgo;
