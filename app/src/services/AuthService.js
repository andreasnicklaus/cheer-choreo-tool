import router from "@/router";
import ax from "./RequestService";
import store from "@/store";
import i18n from "@/plugins/vue-i18n";

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

  async ssoLogin(ssoToken) {
    return ax
      .post("/auth/sso", { ssoToken })
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

  async requestSSO(email) {
    return ax.post("/auth/ssoRequest", { email }).then((res) => res.data);
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
      router
        .push({ name: "Login", params: { locale: i18n.locale } })
        .catch(() => {});
  }

  changePassword(password) {
    return ax.put("/user", { password }).then((res) => res.data);
  }

  updateUserInfo(username, email) {
    return ax.put("/auth/me", { username, email }).then((res) => {
      return res.data;
    });
  }

  updateProfilePicture(profilePicture) {
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    return ax
      .put("/auth/me/profilePicture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
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

  getProfileImage(userId, extension) {
    const profileImageUrl = `/auth/me/profilePicture/${userId}.${extension}`;
    return ax.get(profileImageUrl, { responseType: "blob" });
  }

  deleteProfilePicture() {
    return ax.delete("/auth/me/profilePicture").then((res) => res.data);
  }
}

export default new AuthService();
