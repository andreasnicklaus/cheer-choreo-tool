module.exports = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
    meta: { prerender: true },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { prerender: true },
  },
  {
    path: "/start",
    name: "Start",
    component: () => import("../views/StartView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "/account",
    name: "Account",
    component: () => import("../views/AccountView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "/choreo/:choreoId",
    name: "Choreo",
    component: () => import("../views/EditView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "/team/:teamId",
    name: "Team",
    component: () => import("../views/TeamView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "/video/:choreoId",
    name: "Video",
    component: () => import("../views/VideoView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "/pdf/:choreoId",
    name: "PDF",
    component: () => import("../views/PdfView.vue"),
    meta: { sitemap: { ignoreRoute: true }, private: true },
  },
  {
    path: "/hilfe",
    name: "Help",
    component: () => import("../views/HelpView.vue"),
    meta: { prerender: true },
  },
  {
    path: "/impressum",
    name: "Impressum",
    component: () => import("../views/ImpressumView.vue"),
    meta: { prerender: true },
  },
  {
    path: "/datenschutz",
    name: "Datenschutz",
    component: () => import("../views/DatenschutzView.vue"),
    meta: { prerender: true },
  },
];
