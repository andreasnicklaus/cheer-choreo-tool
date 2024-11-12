import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import routes from "./routes";

Vue.use(VueRouter);

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

  if (from.name == to.name && from.params == to.params) return false;

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
