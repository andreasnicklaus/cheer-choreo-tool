import i18n from "@/plugins/vue-i18n";
import router from "@/router";

/**
 * Service for managing application language and locale settings.
 * @class LanguageService
 */
const localStorageKey = "cp-locale";

class LanguageService {
  /**
   * Set the application language.
   * @param {string} language - Language code
   * @param {Object} [options] - Options for language change
   * @param {boolean} [options.routeAfterChange=true] - Whether to route after change
   * @param {boolean} [options.storeInLocalStorage=true] - Whether to store in localStorage
   * @returns {void}
   */
  setLanguage(
    language,
    { routeAfterChange = true, storeInLocalStorage = true } = {}
  ) {
    const options = {
      routeAfterChange,
      storeInLocalStorage,
    };

    if (options.storeInLocalStorage)
      localStorage.setItem(localStorageKey, language);
    document.documentElement.lang = language;

    i18n.locale = language;
    if (options.routeAfterChange)
      router
        .replace({
          params: { locale: language },
        })
        .catch(() => {});
  }

  /**
   * Load the preferred language from localStorage or browser settings.
   * @param {Array} availableLocales - Array of available locale codes
   * @returns {string} The selected locale
   */
  loadLanguage(availableLocales) {
    let locale = "de";

    const usersLanguage = window.navigator.language.split("-")[0];
    const storedLanguage = localStorage.getItem(localStorageKey);

    if (storedLanguage) {
      locale = storedLanguage;
    } else if (availableLocales.includes(usersLanguage)) {
      locale = usersLanguage;
    }

    return locale;
  }
}

export default new LanguageService();
