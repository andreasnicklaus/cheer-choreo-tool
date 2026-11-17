// Single source of truth for the locales the app supports.
//
// Kept in a side-effect-free module so it can be imported by both the browser
// (vue-i18n, router) and the Node build scripts (prerender, sitemap) without
// pulling in browser-only globals.

export const supportedLocales = ["de", "en"];
