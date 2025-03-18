const { defineConfig } = require("@vue/cli-service");
const routes = require("./src/router/routes");
const PrerenderSpaPlugin = require("@dreysolano/prerender-spa-plugin");
const path = require("path");

process.env.VUE_APP_VERSION = require("./package.json").version;

const langPrefixes = ["de", "en"];

const prerenderRoutes = [
  routes.filter((r) => r.meta?.prerender),
  ...routes
    .filter((r) => r.path.match(/\/:[a-zA-Z]*/) && r.children)
    .map((r) =>
      r.children
        .filter((c) => c.meta?.prerender)
        .map((c) =>
          (r.meta.sitemap.slugs || langPrefixes).map((param) => ({
            ...c,
            path: `/${param}/${c.path}`,
          }))
        )
    ),
]
  .flat(Infinity)
  .map((r) => r.path);

const productionPlugins = [
  new PrerenderSpaPlugin({
    staticDir: path.join(__dirname, "dist"),
    routes: prerenderRoutes,
    minify: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      keepClosingSlash: true,
      sortAttributes: true,
      sortClassName: true,
      minifyCSS: true,
      minifyJS: true,
    },
    renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
      inject: {},
      renderAfterElementExists: "[data-view]",
    }),
    postProcess: (renderedRoute) => {
      renderedRoute.html = renderedRoute.html
        .replace(
          /<link href="(.*?)" rel="stylesheet">/g,
          `<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link href="$1" rel="stylesheet"></noscript>`
        )
        .replace(
          /<link rel="stylesheet" (.*?)>/g,
          `<link rel="preload" $1 as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" $1></noscript>`
        )
        .replace(/<script (((?!defer).)*?)>/g, "<script $1 defer>")
        .replace('id="app"', 'id="app" data-server-rendered="true"');

      return renderedRoute;
    },
  }),
];

module.exports = defineConfig({
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.plugins.push(...productionPlugins);
    }
    config.optimization = {
      runtimeChunk: "single",
      minimize: true,
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        maxSize: 500_000,
      },
    };
  },
  pluginOptions: {
    sitemap: {
      baseURL: "https://www.choreo-planer.de",
      routes,
      trailingSlash: true,
      pretty: true,
      defaults: {
        lastmod: new Date().toISOString().split("T")[0],
      },
    },
  },
  pwa: {
    name: "Choreo Planer",
    themeColor: "#007bff",
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },
});
