// Centralized, per-locale slug map for public routes.
//
// This is the single source of truth for localized URL slugs. Adding a new
// language later only requires:
//   1. adding its messages to src/plugins/vue-i18n.ts
//   2. adding a column here for every route key
// The router, prerenderer and sitemap generator all derive their behaviour
// from this map, so no route-table edits are needed.
//
// NOTE: keep the set of locales here in sync with the messages registered in
// src/plugins/vue-i18n.ts (that module is the runtime source of truth for
// which locales actually exist).

import { supportedLocales } from "../i18n/supportedLocales.js";

// Re-export so router/build scripts can import everything from one place.
export { supportedLocales };

// Default locale for the (optional) top-level, non-prefixed routes.
export const defaultLocale = supportedLocales[0];

// routeKey -> { locale: slug }. An empty slug means the route lives at the
// locale root (e.g. Home -> /en, /de).
/**
 * @typedef {Record<string, Record<string, string>>} RouteSlugsMap
 */

/** @type {RouteSlugsMap} */
export const routeSlugs = {
  Home: { de: "", en: "" },
  Pricing: { de: "preise", en: "pricing" },
  About: { de: "ueber-uns", en: "about" },
  Help: { de: "hilfe", en: "help" },
  Contact: { de: "kontakt", en: "contact" },
  Impressum: { de: "impressum", en: "impressum" },
  Datenschutz: { de: "datenschutz", en: "privacy" },
};

// Convenience: the canonical slug for a route key in a given locale, falling
// back to the English slug and finally to the route key itself.
export function canonicalSlug(routeKey, locale) {
  const slugs = routeSlugs[routeKey];
  if (!slugs) return null;
  return (
    slugs[locale] ??
    slugs[defaultLocale] ??
    Object.values(slugs).find((s) => s !== undefined) ??
    null
  );
}

// All distinct slugs for a route key (used to build the alias list).
export function allSlugs(routeKey) {
  const slugs = routeSlugs[routeKey];
  if (!slugs) return [];
  return [...new Set(Object.values(slugs).filter((s) => s !== undefined))];
}

// Build a locale-aware route location object for a localized public route.
// Vue Router resolves named routes to their static base path (the default
// locale's slug), so links rendered from a name keep the wrong slug for other
// locales. Use this helper when you need the canonical path as an object that
// can be passed to `:to` / `$router.push`.
export function localizedRoute(routeKey, locale) {
  const slug = canonicalSlug(routeKey, locale);
  return { path: slug ? `/${locale}/${slug}` : `/${locale}` };
}
