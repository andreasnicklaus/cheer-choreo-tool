const { defineConfig } = require("@vue/cli-service");
const routes = require("./src/router/routes");
const PrerenderSpaPlugin = require("@dreysolano/prerender-spa-plugin");
const path = require("path");

process.env.VUE_APP_VERSION = require("./package.json").version;

const productionPlugins = [
  new PrerenderSpaPlugin({
    staticDir: path.join(__dirname, "dist"),
    routes: routes
      .filter((r) => r.meta?.prerender)
      .map((r) => [r.path, r.alias])
      .flat(Infinity)
      .filter((r) => r),
    minify: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      keepClosingSlash: true,
      sortAttributes: true,
    },
    renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
      inject: {},
      renderAfterElementExists: "[data-view]",
    }),
    postProcess: (renderedRoute) => {
      const [_, ...breadcrumbList] = renderedRoute.route.split("/");
      renderedRoute.html = renderedRoute.html
        .replace(
          /<link href="(.*?)" rel="stylesheet">/g,
          `<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link href="$1" rel="stylesheet"></noscript>`
        )
        .replace(
          /<link rel="stylesheet" (.*?)>/g,
          `<link rel="preload" $1 as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" $1></noscript>`
        )
        .replace(/<script (((?!defer).)*?)>/g, "< $1 defer>")
        .replace('id="app"', 'id="app" data-server-rendered="true"')
        .replace(
          /(.*?)<\/body><\/html>/g,
          `$1<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbList.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: routes.find((r) => r.path === item)?.name || item,
              item: `https://www.choreo-planer.de/${breadcrumbList
                .slice(0, index + 1)
                .join("/")}`,
            })),
          })}
</script></body></html>`
        );

      return renderedRoute;
    },
  }),
];

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
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
