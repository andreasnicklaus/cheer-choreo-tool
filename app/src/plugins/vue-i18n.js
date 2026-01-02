import Vue from "vue";
import VueI18n from "vue-i18n";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import LanguageService from "@/services/LanguageService";

Vue.use(VueI18n);

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

const i18n = new VueI18n({
  locale: LanguageService?.loadLanguage(Object.keys(messages)) || "de",
  fallbackLocale: "de",
  messages,
  dateTimeFormats,
});

export default i18n;
