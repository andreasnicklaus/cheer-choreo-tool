import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import store from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/start",
    name: "Start",
    component: () => import("../views/StartView.vue"),
    meta: { private: true },
  },
  {
    path: "/account",
    name: "Account",
    component: () => import("../views/AccountView.vue"),
    meta: { private: true },
  },
  {
    path: "/edit/:choreoId",
    name: "Edit",
    component: () => import("../views/EditView.vue"),
    meta: { private: true },
  },
  {
    path: "/team/:teamId",
    name: "Team",
    component: () => import("../views/TeamView.vue"),
    meta: { private: true },
  },
  {
    path: "/video/:choreoId",
    name: "Video",
    component: () => import("../views/VideoView.vue"),
    meta: { private: true },
  },
  {
    path: "/pdf/:choreoId",
    name: "PDF",
    component: () => import("../views/PdfView.vue"),
    meta: { private: true },
  },
  {
    path: "/hilfe",
    name: "Help",
    component: () => import("../views/HelpView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const isPrivate = to.meta.private;

  if (from.name == to.name) return false;

  if (!isPrivate) next();
  else if (!store.state.loggedIn)
    next({
      name: "Login",
      query: {
        redirectUrl: to.path,
        ...to.query,
      },
    });
  else next();
});

export default router;
