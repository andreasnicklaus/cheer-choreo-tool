import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap-vue";
import "./plugins/vue-meta";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import vueMatomo from "vue-matomo";
import VueCookie from "vue-cookie";
import VueMeta from "vue-meta";

Vue.config.productionTip = false;

Vue.use(VueMeta, {
  refreshOnceOnNavigation: true,
});

Vue.use(vueMatomo, {
  host: "https://matomo.andreasnicklaus.de",
  siteId: 3,
  router,
});

Vue.use(VueCookie);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

// Disable Matomo Tracking Before Consent
window._paq.push(["requireConsent"]);
// Initialize Matomo Tracking
window._paq.push(["trackPageView"]);
