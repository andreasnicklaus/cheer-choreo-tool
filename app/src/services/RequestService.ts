import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { setupCache } from "axios-cache-interceptor";
import AuthService from "./AuthService";
import store from "@/store";
import router from "@/router";
import i18n from "@/plugins/vue-i18n";
import { logRequest, error as logError } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";
import env from "../utils/env";

export interface RequestConfig extends InternalAxiosRequestConfig {
  requestStarted?: number;
  skipRoutingToLogin?: boolean;
}

/**
 * Axios request service with authentication and error handling.
 * @module RequestService
 */
const ax = setupCache(
  axios.create({
    baseURL: getApiDomain(),
  }),
  { headerInterpreter: () => 50 }
) as unknown as AxiosInstance;

ax.interceptors.response.use(
  (response: any) => {
    logRequest(
      response.status,
      Date.now() - (response.config as RequestConfig)?.requestStarted!,
      response.config.url
    );
    return response;
  },
  (error: AxiosError<unknown, RequestConfig>) => {
    logRequest(
      error?.response?.status || 0,
      Date.now() - (error?.config as RequestConfig)?.requestStarted!,
      error.config?.url || ""
    );
    if (!error.response?.status) {
      AuthService.removeToken();
      store.commit("setLoginState", false);
      return Promise.reject(error);
    }

    switch (error.response.status) {
      case 401:
        if (error.config?.headers?.Authorization) {
          AuthService.removeToken();
          store.commit("setLoginState", false);
        }
        if (!(error.config as RequestConfig)?.skipRoutingToLogin)
          router
            .push({
              name: "Login",
              params: { locale: i18n.global.locale.value },
            })
            .catch(() => {
              logError(
                "Redundant navigation to login",
                ERROR_CODES.REDUNDANT_ROUTING
              );
            });
        break;
      case 403:
        if (error.config?.headers?.Authorization) {
          AuthService.removeToken();
          store.commit("setLoginState", false);
        }
        if (!(error.config as RequestConfig)?.skipRoutingToLogin)
          router
            .push({
              name: "Login",
              params: { locale: i18n.global.locale.value },
            })
            .catch(() => {
              logError(
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
  (config: RequestConfig) => {
    const token = AuthService.getAuthToken();
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }

    const locale = i18n.global.locale.value;
    if (locale) config.headers["Accept-Language"] = locale;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

ax.interceptors.request.use((config: RequestConfig) => {
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
  return env.PROD ? "https://api.choreo-planer.de/" : "http://localhost:3000/";
}

export default ax;
