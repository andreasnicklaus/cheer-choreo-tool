/**
 * Time formatting utilities
 * @module Util:Time
 */

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import de from "javascript-time-ago/locale/de.json";
import i18n from "@/plugins/vue-i18n";
import { debug } from "./logging";

if (de?.now?.now && typeof de.now.now !== "string") {
  de.now.now.past = "vor einem Moment";
}

TimeAgo.addLocale(en);
TimeAgo.addLocale(de);

function initTimeAgo(locale: string) {
  return new TimeAgo(locale);
}

/**
 * Turn a date into a "time ago" string, e.g. "5 minutes ago", "2 days ago"
 *
 * @param {string | Date | null} date - Date to format
 * @param {string} [locale] - Locale to use for formatting (defaults to current i18n locale)
 * @returns {string | null} Formatted time ago string or null if date is null
 */
function toTimeAgo(
  date: string | Date | null,
  locale: string = i18n.global.locale.value
): string | null {
  debug("Converting time to timeAgo", { date, locale });
  const timeAgo = initTimeAgo(locale);
  const result =
    date != null ? timeAgo.format(new Date(date), "round-minute") : null;
  debug("Converted time", { result });
  return result;
}

export default toTimeAgo;
