import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import de from "javascript-time-ago/locale/de.json";
import i18n from "@/plugins/vue-i18n";

de.now.now.past = "vor einem Moment";

TimeAgo.addLocale(en);
TimeAgo.addLocale(de);

function initTimeAgo(locale) {
  return new TimeAgo(locale, { locale });
}

function toTimeAgo(date, locale = i18n.locale) {
  const timeAgo = initTimeAgo(locale);
  return timeAgo.format(new Date(date), "round-minute");
}

export default toTimeAgo;
