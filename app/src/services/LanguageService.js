import i18n from "@/plugins/vue-i18n";
import router from "@/router";

const localStorageKey = "cp-locale";

class LanguageService {
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
