const unlocalizedRoutes = require("./unlocalized-routes");

module.exports = [
  // {
  //   path: "/",
  //   redirect: `/${i18n.fallbackLocale}`,
  // },
  ...unlocalizedRoutes.map((route) => {
    return {
      ...route,
      path: `/${route.path}`,
      alias: route.alias ? `/${route.alias}` : undefined,
      name: `${route.name}unLocalized`,
    };
  }),
  {
    path: "/:locale?",
    component: {
      render(c) {
        return c("router-view");
      },
    },
    children: unlocalizedRoutes,
    meta: { sitemap: { slugs: ["en", "de"] } },
  },
];
