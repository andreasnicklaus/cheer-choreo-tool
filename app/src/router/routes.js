import unlocalizedRoutes from "./unlocalized-routes.mjs";

export default [
  // {
  //   path: "/",
  //   redirect: `/${i18n.fallbackLocale}`,
  // },
  ...unlocalizedRoutes.map((route) => {
    const mappedRoute = {
      ...route,
      path: `/${route.path}`,
      name: `${route.name}unLocalized`,
    };

    // Handle alias - ensure it's an array and prepend /
    if (route.alias) {
      const aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
      mappedRoute.alias = aliases.map((a) => `/${a}`);
    }

    return mappedRoute;
  }),
  {
    path: "/:locale?",
    component: {
      template: "<router-view></router-view>",
    },
    children: unlocalizedRoutes,
    meta: { sitemap: { slugs: ["en", "de"] } },
  },
];
