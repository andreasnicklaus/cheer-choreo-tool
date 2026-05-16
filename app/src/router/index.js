import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import routes from "./routes";
import env from "../utils/env";
import i18n from "@/plugins/vue-i18n";
import LanguageService from "@/services/LanguageService";

const router = createRouter({
  history: createWebHistory(env.BASE_URL),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
});

router.beforeEach((to, from) => {
  const newLocale = to.params.locale;
  const prevLocale = from.params.locale;

  // If the locale hasn't changed, do nothing
  if (newLocale != prevLocale) {
    if (i18n.global.availableLocales.includes(newLocale)) {
      LanguageService.setLanguage(newLocale, {
        routeAfterChange: false,
      });
    } else {
      return { ...to, params: { locale: i18n.global.locale } };
    }
  }

  const isPrivate = to.meta.private;

  if (
    from.name === to.name &&
    JSON.stringify(from.params) === JSON.stringify(to.params)
  )
    return false;

  if (!isPrivate) return;
  else if (!store.state.loggedIn)
    return {
      name: "Login",
      query: {
        redirectUrl: to.path,
        ...to.query,
      },
    };
  else return;
});

export default router;
