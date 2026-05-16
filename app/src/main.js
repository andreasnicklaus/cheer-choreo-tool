import { createApp } from "vue";
import bootstrapPlugin from "./plugins/bootstrap-vue";
import i18n from "./plugins/vue-i18n";
import headPlugin from "./plugins/vue-meta";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vueMatomo from "vue-matomo";
import "vue3-country-flag-icon/dist/CountryFlag.css";
import { isPrerender } from "./utils/isPrerender";

const app = createApp(App);

app.use(bootstrapPlugin);
app.use(router);
app.use(store);
app.use(i18n);

app.use(headPlugin);

if (!isPrerender())
  app.use(vueMatomo, {
    host: "https://matomo.choreo-planer.de",
    siteId: 3,
    router,
  });

app.mount("#app");

if (!isPrerender()) {
  // Disable Matomo Tracking Before Consent
  window._paq.push(["requireConsent"]);
  // Initialize Matomo Tracking
  window._paq.push(["trackPageView"]);
  window._paq.push(["enableHeartBeatTimer"]);
}
