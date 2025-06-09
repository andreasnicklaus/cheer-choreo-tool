import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import AuthService from "./AuthService";
import store from "@/store";
import router from "@/router";
import i18n from "@/plugins/vue-i18n";
import { logRequest } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

/**
 * Axios request service with authentication and error handling.
 * @module RequestService
 */
const ax = setupCache(
  axios.create({
    baseURL: getApiDomain(),
  }),
  { headerInterpreter: () => 50 }
);

ax.interceptors.response.use(
  (response) => {
    logRequest(
      response.status,
      Date.now() - response.config?.requestStarted,
      response.config.url
    );
    return response;
  },
  (error) => {
    logRequest(
      error?.response?.status,
      Date.now() - error?.config?.requestStarted,
      error.config.url
    );
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
          .catch(() => {
            error(
              "Redundant navigation to login",
              ERROR_CODES.REDUNDANT_ROUTING
            );
          });
        break;
      case 403:
        AuthService.removeToken();
        store.commit("setLoginState", false);
        router
          .push({
            name: "Login",
            params: { locale: i18n.locale },
          })
          .catch(() => {
            error(
              "Redundant navigation to login",
              ERROR_CODES.REDUNDANT_ROUTING
            );
          });
        break;
      default:
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

    const locale = i18n.locale;
    if (locale) config.headers["Accept-Language"] = locale;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ax.interceptors.request.use((config) => {
  config.requestStarted = Date.now();
  return config;
});

/**
 * Get the API domain based on the environment.
 *
 * @export
 * @returns {("https://api.choreo-planer.de/" | "http://localhost:3000/")}
 */
export function getApiDomain() {
  return process.env.NODE_ENV == "production"
    ? "https://api.choreo-planer.de/"
    : "http://localhost:3000/";
}

export default ax;
