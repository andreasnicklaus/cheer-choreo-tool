import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import routes from "./routes";
import {
  canonicalSlug,
  routeSlugs,
  supportedLocales,
  defaultLocale,
} from "./routeSlugs";
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
    } else {
      const segments = to.path.split("/").filter(Boolean);
      if (segments.length === 1) {
        const currentSlug = segments[0];
        let matchedKey: string | null = null;
        let matchedLocale: string | null = null;
        for (const [key, slugs] of Object.entries(routeSlugs)) {
          for (const [loc, slug] of Object.entries(
            slugs as Record<string, string>
          )) {
            if (slug === currentSlug) {
              matchedKey = key;
              matchedLocale = loc;
              break;
            }
          }
          if (matchedKey) break;
        }
        if (matchedKey && matchedKey !== "Home") {
          const locale = matchedLocale || defaultLocale;
          const preferred = canonicalSlug(matchedKey, locale);
          const targetPath = preferred
            ? `/${locale}/${preferred}`
            : `/${locale}`;
          if (targetPath !== to.path) {
            return {
              path: targetPath,
              query: to.query,
              hash: to.hash,
              replace: true,
            };
          }
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

// Resolve named routes for localized public pages to their locale-preferred slug
// so that rendered `href` attributes (and programmatic navigation) use the
// canonical URL directly instead of the static base path. The before-each guard
// still canonicalizes any stale/alias URL that reaches it.
const localizedRouteKeys = new Set(Object.keys(routeSlugs));

function localizeRouteTarget(to: any, currentLocation: any) {
  if (typeof to === "string" || !to || typeof to !== "object") return to;
  const rawName = typeof to.name === "string" ? to.name : null;
  const routeKey = rawName ? rawName.replace(/unLocalized$/, "") : null;
  if (!routeKey || !localizedRouteKeys.has(routeKey)) return to;

  const locale =
    (typeof to.params?.locale === "string" && to.params.locale) ||
    (typeof currentLocation?.params?.locale === "string" &&
      currentLocation.params.locale) ||
    defaultLocale;
  if (!supportedLocales.includes(locale)) return to;

  const slug = canonicalSlug(routeKey, locale);
  const { name: _name, params: _params, ...rest } = to;
  return { ...rest, path: slug ? `/${locale}/${slug}` : `/${locale}` };
}

const originalResolve = router.resolve.bind(router);
router.resolve = ((to: any, currentLocation?: any) =>
  originalResolve(
    localizeRouteTarget(to, currentLocation),
    currentLocation
  )) as typeof router.resolve;

export default router;
