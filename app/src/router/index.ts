import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import routes from "./routes";
import { canonicalSlug, routeSlugs } from "./routeSlugs";
import env from "../utils/env";
import i18n from "@/plugins/vue-i18n";
import LanguageService from "@/services/LanguageService";
import type { RouteLocationNormalized } from "vue-router";

const router = createRouter({
  history: createWebHistory(env.BASE_URL),
  routes,
  scrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    const localeOnlyChange =
      to.name === from.name &&
      JSON.stringify({ ...to.params, locale: undefined }) ===
        JSON.stringify({ ...from.params, locale: undefined });
    if (localeOnlyChange) return;
    return { left: 0, top: 0 };
  },
});

router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    const newLocale = to.params.locale as string | undefined;
    const prevLocale = from.params.locale as string | undefined;

    // If the locale hasn't changed, do nothing
    if (newLocale != prevLocale) {
      if (
        newLocale &&
        (i18n.global.availableLocales as string[]).includes(newLocale)
      ) {
        LanguageService.setLanguage(newLocale, {
          routeAfterChange: false,
        });
      } else {
        return { ...to, params: { locale: i18n.global.locale } };
      }
    }

    // Canonicalize localized slugs: a known slug that does not match the active
    // locale redirects (replace) to that locale's preferred slug, e.g.
    // /de/pricing -> /de/preise. Only known aliases are touched; unknown paths
    // fall through to the normal SPA handling.
    const slugLocale = to.params.locale as string | undefined;
    if (slugLocale) {
      const routeKey = String(to.name ?? "").replace(/unLocalized$/, "");
      const preferred =
        routeSlugs[routeKey] != null
          ? canonicalSlug(routeKey, slugLocale)
          : null;
      if (preferred !== null && routeKey !== "Home") {
        const segments = to.path.split("/").filter(Boolean);
        const currentSlug =
          segments.length > 1 ? segments[segments.length - 1] : "";
        if (preferred !== currentSlug) {
          const targetPath = preferred
            ? `/${slugLocale}/${preferred}`
            : `/${slugLocale}`;
          return {
            path: targetPath,
            query: to.query,
            hash: to.hash,
            replace: true,
          };
        }
      }
    }

    const isPrivate = Boolean(to.meta.private);

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
  }
);

export default router;
