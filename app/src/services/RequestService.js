import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import AuthService from "./AuthService";
import store from "@/store";
import router from "@/router";
import i18n from "@/plugins/vue-i18n";

const ax = setupCache(
  axios.create({
    baseURL: getApiDomain(),
  }),
  { headerInterpreter: () => 50 }
);

ax.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response?.status) {
      AuthService.removeToken();
      store.commit("setLoginState", false);
      return Promise.reject(error);
    }

    switch (error.response.status) {
      case 401:
        AuthService.removeToken();
        store.commit("setLoginState", false);
        router
          .push({
            name: "Login",
            params: { locale: i18n.locale },
          })
          .catch(() => {});
        break;
      case 403:
        AuthService.removeToken();
        store.commit("setLoginState", false);
        router
          .push({
            name: "Login",
            params: { locale: i18n.locale },
          })
          .catch(() => {});
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

export function getApiDomain() {
  return process.env.NODE_ENV == "production"
    ? "https://api.choreo-planer.de/"
    : "http://localhost:3000/";
}

export default ax;
