import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap-vue";
import "./plugins/vue-flag-icon";
import i18n from "./plugins/vue-i18n";
import "./plugins/vue-meta";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vueMatomo from "vue-matomo";
import VueCookie from "vue-cookie";
import VueMeta from "vue-meta";
import VueFlagIcon from "vue-flag-icon";

Vue.config.productionTip = false;

Vue.use(VueMeta, {
  refreshOnceOnNavigation: true,
});

if (!window.__PRERENDER_INJECTED)
  Vue.use(vueMatomo, {
    host: "https://matomo.choreo-planer.de",
    siteId: 3,
    router,
  });

Vue.use(VueCookie);

new Vue({
  router,
  store,
  i18n,
  VueFlagIcon,
  render: (h) => h(App),
}).$mount("#app");

if (!window.__PRERENDER_INJECTED) {
  // Disable Matomo Tracking Before Consent
  window._paq.push(["requireConsent"]);
  // Initialize Matomo Tracking
  window._paq.push(["trackPageView"]);
  window._paq.push(["enableHeartBeatTimer"]);
}
