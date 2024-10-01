import router from "@/router";
import ax from "./RequestService";
import store from "@/store";

const tokenStorageKey = "cheer-token";

class AuthService {
  async login(username, password) {
    return ax
      .post("/auth/login", { username, password })
      .then((res) => {
        const token = res.data;
        if (!token) {
          store.commit("setLoginState", false);
          throw Error("No token received");
        }

        localStorage.setItem(tokenStorageKey, token);
        store.commit("setLoginState", true);
        return true;
      })
      .catch((e) => {
        store.commit("setLoginState", false);
        throw e;
      });
  }

  async register(username, password) {
    return ax
      .post("/auth", { username, password })
      .then((res) => {
        const token = res.data;
        if (!token) {
          store.commit("setLoginState", false);
          throw Error("No token received");
        }

        localStorage.setItem(tokenStorageKey, token);
        store.commit("setLoginState", true);
        return true;
      })
      .catch((e) => {
        store.commit("setLoginState", false);
        throw e;
      });
  }

  async logout() {
    this.removeToken();
    store.commit("setLoginState", false);
    if (router.currentRoute.meta.private)
      router.push({ name: "Login" }).catch(() => {});
  }

  getAuthToken() {
    return localStorage.getItem(tokenStorageKey);
  }

  removeToken() {
    return localStorage.removeItem(tokenStorageKey);
  }

  getUserInfo() {
    return ax.get("/auth/me").then((res) => res.data);
  }
}

export default new AuthService();