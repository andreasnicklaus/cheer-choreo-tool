import router from "@/router";
import ax from "./RequestService";
import store from "@/store";

const tokenStorageKey = "choreo-planer-token";

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

  async register(username, password, email) {
    return ax
      .post("/auth", { username, password, email })
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

  changeUsername(username) {
    return ax.put("/user", { username }).then((res) => res.data);
  }

  changePassword(password) {
    return ax.put("/user", { password }).then((res) => res.data);
  }

  deleteAccount() {
    return ax.delete("/user").then((res) => {
      this.logout();
      return res.data;
    });
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
