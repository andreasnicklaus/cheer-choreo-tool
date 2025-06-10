import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import routes from "./routes";
import i18n from "@/plugins/vue-i18n";
import LanguageService from "@/services/LanguageService";
import { debug } from "@/utils/logging";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  debug("Routing to new page", { to, from });
  const newLocale = to.params.locale;
  const prevLocale = from.params.locale;

  // If the locale hasn't changed, do nothing
  if (newLocale != prevLocale) {
    if (i18n.availableLocales.includes(newLocale)) {
      LanguageService.setLanguage(newLocale, {
        routeAfterChange: false,
      });
    } else router.replace({ ...to, params: { locale: i18n.locale } });
  }

  const isPrivate = to.meta.private;

  if (from.name == to.name && from.params == to.params) return false;

  if (!isPrivate) next();
  else if (!store.state.loggedIn)
    next({
      name: "Login",
      query: {
        redirectUrl: to.path,
        ...to.query,
      },
    });
  else next();
});

export default router;
