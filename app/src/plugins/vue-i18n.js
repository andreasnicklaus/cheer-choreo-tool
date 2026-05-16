import { createI18n } from "vue-i18n";
import de from "../i18n/de.json";
import en from "../i18n/en.json";

const messages = {
  de,
  en,
};

const dateTimeFormats = {
  en: {
    time: {
      hour: "numeric",
      minute: "numeric",
    },
    date: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    },
  },
  de: {
    time: {
      hour: "numeric",
      minute: "numeric",
    },
    date: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    },
  },
};

// Load language from localStorage or browser settings
// (moved from LanguageService to avoid circular dependency)
const localStorageKey = "cp-locale";
const storedLanguage = localStorage.getItem(localStorageKey);
const usersLanguage = window.navigator.language.split("-")[0];
const availableLocales = Object.keys(messages);

let locale = "de";
if (storedLanguage && availableLocales.includes(storedLanguage)) {
  locale = storedLanguage;
} else if (availableLocales.includes(usersLanguage)) {
  locale = usersLanguage;
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: locale,
  fallbackLocale: "de",
  messages,
  datetimeFormats: dateTimeFormats,
  warnHtmlMessage: false,
});

export default i18n;
