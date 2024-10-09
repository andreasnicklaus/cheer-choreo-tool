import Vue from "vue";
import VueMatomo from "vue-matomo";

Vue.use(VueMatomo, {
  host: "https://matomo.andreasnicklaus.de",
  siteId: 3,
});

window._paq.push(["trackPageView"]);
