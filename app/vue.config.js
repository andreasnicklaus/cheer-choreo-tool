const { defineConfig } = require("@vue/cli-service");
const routes = require("./src/router/routes");

process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    sitemap: {
      baseURL: "https://cheer.andreasnicklaus.de",
      routes,
      trailingSlash: true,
      pretty: true,
      defaults: {
        lastmod: new Date().toISOString().split("T")[0],
      },
    },
  },
});
