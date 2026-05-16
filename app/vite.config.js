import { defineConfig } from "vite";
import { readFileSync, existsSync, writeFileSync } from "fs";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import IconsResolve from "unplugin-icons/resolver";
import { VitePWA } from "vite-plugin-pwa";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));
const betterStackConfig = JSON.parse(
  readFileSync("./better-stack.config.json", "utf-8")
);
const featureFlagConfig = JSON.parse(
  readFileSync("./feature-flags.config.json", "utf-8")
);

function preserveManifestTrailingNewline() {
  const ensureTrailingNewline = (filePath) => {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, "utf-8");
      if (!content.endsWith("\n")) {
        writeFileSync(filePath, content + "\n");
      }
    }
  };
  return {
    name: "preserve-manifest-trailing-newline",
    configureServer(server) {
      ensureTrailingNewline("public/manifest.json");
      server.watcher.on("change", (file) => {
        if (file.includes("manifest.json")) {
          ensureTrailingNewline(file);
        }
      });
    },
    closeBundle() {
      ensureTrailingNewline("public/manifest.json");
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
  },
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    include: ["vue3-html2pdf", "jspdf"],
    exclude: [],
    esbuildOptions: {
      target: "esnext",
    },
  },
  plugins: [
    vue(),
    preserveManifestTrailingNewline(),
    tsconfigPaths(),
    Components({
      resolvers: [IconsResolve()],
      dts: true,
    }),
    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Choreo Planer",
        short_name: "Choreo Planer",
        description:
          "Plan your choreographies quickly and easily with the choreo planner! Perfect for cheerleading, dance and floor gymnastics. 100% free. Try now!",
        theme_color: "#007bff",
        icons: [
          {
            src: "./img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "./img/icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "./img/icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "./img/icons/apple-touch-icon-60x60.png",
            sizes: "60x60",
            type: "image/png",
          },
          {
            src: "./img/icons/apple-touch-icon-76x76.png",
            sizes: "76x76",
            type: "image/png",
          },
          {
            src: "./img/icons/apple-touch-icon-120x120.png",
            sizes: "120x120",
            type: "image/png",
          },
          {
            src: "./img/icons/apple-touch-icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "./img/icons/apple-touch-icon-180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "./img/icons/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "./img/icons/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "./img/icons/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "./img/icons/msapplication-icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "./img/icons/mstile-150x150.png",
            sizes: "150x150",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  define: {
    global: {},

    ...Object.fromEntries(
      Object.entries({
        VERSION: version,
        BETTERSTACK_INGESTING_HOST: betterStackConfig.INGESTING_HOST,
        BETTERSTACK_SOURCE_TOKEN: betterStackConfig.SOURCE_TOKEN,
        FEATURE_FLAG_API_KEY: featureFlagConfig.FEATURE_FLAG_API_KEY,
      }).map(([key, value]) => [
        `import.meta.env.VITE_${key.toUpperCase()}`,
        JSON.stringify(value),
      ])
    ),
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    include: ["./tests/unit/**/*.test.js"],
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: [
        "src/docsDef.js",
        "src/main.js",
        "src/plugins/bootstrap-vue.js",
        "src/plugins/vue-meta.js",
        "src/i18n/**",
        "src/router/index.js",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
