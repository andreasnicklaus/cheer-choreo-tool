import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import AuthService from "./AuthService";
import store from "@/store";
import router from "@/router";

const ax = setupCache(
  axios.create({
    baseURL:
      process.env.NODE_ENV == "production"
        ? "https://api.cheer.andreasnicklaus.de/"
        : "http://localhost:3000/",
  }),
  { headerInterpreter: () => 50 }
);

ax.interceptors.response.use(
  (response) => response,
  (error) => {
    switch (error.response.status) {
      case 401:
        AuthService.removeToken();
        store.commit("setLoginState", false);
        router.push({ name: "Login" }).catch(() => {});
        break;
      case 403:
        AuthService.removeToken();
        store.commit("setLoginState", false);
        router.push({ name: "Login" }).catch(() => {});
        break;
      default:
        console.warn(error);
    }
    return Promise.reject(error);
  }
);

ax.interceptors.request.use(
  (config) => {
    const token = AuthService.getAuthToken();
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default ax;
