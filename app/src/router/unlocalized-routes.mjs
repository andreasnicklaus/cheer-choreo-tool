import { allSlugs } from "./routeSlugs.js";

// Base route definitions. Localized slugs are NOT hard-coded here; they are
// derived from routeSlugs.js via the helper below so that adding a language
// only touches routeSlugs.js.
const baseRoutes = [
  {
    path: "",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
    meta: { prerender: true },
  },
  {
    path: "login",
    name: "Login",
    alias: ["willkommen"],
    component: () => import("../views/LoginView.vue"),
    meta: { prerender: true },
  },
  {
    path: "auth/callback",
    name: "AuthCallback",
    component: () => import("../views/AuthCallback.vue"),
    meta: { sitemap: { ignoreRoute: true } },
  },
  {
    path: "start",
    name: "Start",
    component: () => import("../views/StartView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "account",
    name: "Account",
    component: () => import("../views/AccountView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "choreo/:choreoId",
    name: "Choreo",
    component: () => import("../views/EditView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "team/:teamId",
    name: "Team",
    component: () => import("../views/TeamView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "video/:choreoId",
    name: "Video",
    component: () => import("../views/VideoView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "pdf/:choreoId",
    name: "PDF",
    component: () => import("../views/PdfView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "hilfe",
    name: "Help",
    component: () => import("../views/HelpView.vue"),
    meta: { prerender: true },
  },
  {
    path: "pricing",
    name: "Pricing",
    component: () => import("../views/PricingView.vue"),
    meta: { prerender: true },
  },
  {
    path: "about",
    name: "About",
    component: () => import("../views/AboutView.vue"),
    meta: { prerender: true },
  },
  {
    path: "contact",
    name: "Contact",
    component: () => import("../views/ContactView.vue"),
    meta: { prerender: true },
  },
  {
    path: "impressum",
    name: "Impressum",
    component: () => import("../views/ImpressumView.vue"),
    meta: { prerender: true },
  },
  {
    path: "datenschutz",
    name: "Datenschutz",
    component: () => import("../views/DatenschutzView.vue"),
    meta: { prerender: true },
  },
];

// Merge any hand-written aliases with the localized slugs from routeSlugs.js.
// The canonical path itself is kept as `path`; localized variants become
// aliases so /de/preise, /en/pricing, ... all resolve to the same route.
function withLocalizedAliases(route) {
  const existing = Array.isArray(route.alias)
    ? route.alias
    : route.alias
      ? [route.alias]
      : [];

  const localized = allSlugs(route.name);
  const aliases = [...new Set([...existing, ...localized])];

  const filtered = aliases.filter((a) => a && a !== route.path);

  const { alias: _originalAlias, ...rest } = route;
  if (filtered.length) return { ...rest, alias: filtered };
  if (route.alias) return { ...rest, alias: route.alias };
  return rest;
}

export default baseRoutes.map(withLocalizedAliases);
