import type { RouteRecordRaw } from "vue-router";
import unlocalizedRoutes from "./unlocalized-routes.mjs";

interface RouteConfig {
  path: string;
  name?: string;
  alias?: string | string[];
  component?: unknown;
  meta?: Record<string, unknown>;
  children?: RouteConfig[];
}

export default [
  ...unlocalizedRoutes.map((route: RouteConfig) => {
    const mappedRoute: RouteConfig = {
      ...route,
      path: `/${route.path}`,
      name: `${route.name}unLocalized`,
    };

    // Handle alias - ensure it's an array and prepend /
    if (route.alias) {
      const aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
      mappedRoute.alias = aliases.map((a: string) => `/${a}`);
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
] as RouteRecordRaw[];
