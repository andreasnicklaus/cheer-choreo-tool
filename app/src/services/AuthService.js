import router from "@/router";
import ax from "./RequestService";
import store from "@/store";
import i18n from "@/plugins/vue-i18n";

const tokenStorageKey = "choreo-planer-token";

/**
 * Service for handling user authentication, including login, registration, and profile management.
 *
 * @class AuthService
 */
class AuthService {
  /**
   * Make a login request with username and password and store the authentication token
   *
   * @async
   * @param {string} username
   * @param {string} password
   * @returns {Boolean} Returns true if the login was successful, otherwise throws an error
   */
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

  /**
   * Make a login request with an SSO token and store the authentication token
   *
   * @async
   * @param {string} ssoToken
   * @returns {Boolean} Returns true if the login was successful, otherwise throws an error
   */
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

  /**
   * Request an SSO login link for the given email address.
   *
   * @async
   * @param {string} email
   * @returns {unknown} Returns the response data from the server
   */
  async requestSSO(email) {
    return ax.post("/auth/ssoRequest", { email }).then((res) => res.data);
  }

  /**
   * Make a registration request with username, password, and email and store the authentication token
   *
   * @async
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @returns {Boolean} Returns true if the registration was successful, otherwise throws an error
   */
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

  /**
   * Remove the authentication token and redirect to the login page if the current route is private
   *
   * @async
   * @returns {void}
   */
  async logout() {
    this.removeToken();
    store.commit("setLoginState", false);
    if (router.currentRoute.meta.private)
      router
        .push({ name: "Login", params: { locale: i18n.locale } })
        .catch(() => {});
  }

  /**
   * Make a request to change the password of the currently logged-in user
   *
   * @param {string} password
   * @returns {unknown} Returns the response data from the server
   */
  changePassword(password) {
    return ax.put("/user", { password }).then((res) => res.data);
  }

  /**
   * Make a request to update the user information of the currently logged-in user
   *
   * @param {string} username
   * @param {string} email
   * @returns {unknown} Returns the response data from the server
   */
  updateUserInfo(username, email) {
    return ax.put("/auth/me", { username, email }).then((res) => {
      return res.data;
    });
  }

  /**
   * Make a request to update the profile picture of the currently logged-in user
   *
   * @param {File} profilePicture
   * @returns {Promise<unknown>} Returns the response data from the server
   */
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

  /**
   * Make a request to delete the currently logged-in user account
   *
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  deleteAccount() {
    return ax.delete("/user").then((res) => {
      this.logout();
      return res.data;
    });
  }

  /**
   * Get the authentication token from local storage
   *
   * @returns {string}
   */
  getAuthToken() {
    return localStorage.getItem(tokenStorageKey);
  }

  /**
   * Remove the authentication token from local storage
   *
   * @returns {void}
   */
  removeToken() {
    return localStorage.removeItem(tokenStorageKey);
  }

  /**
   * Get the user information of the currently logged-in user
   *
   * @returns {Promise<object>} Returns the user information from the server
   */
  getUserInfo() {
    return ax.get("/auth/me").then((res) => res.data);
  }

  /**
   * Get the profile image of a user by user ID and image extension
   *
   * @param {string} userId
   * @param {string} extension
   * @returns {Promise<string>} Returns a promise that resolves to the profile image blob
   */
  getProfileImage(userId, extension) {
    const profileImageUrl = `/auth/me/profilePicture/${userId}.${extension}`;
    return ax.get(profileImageUrl, { responseType: "blob" });
  }

  /**
   * Make a request to delete the profile picture of the currently logged-in user
   *
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  deleteProfilePicture() {
    return ax.delete("/auth/me/profilePicture").then((res) => res.data);
  }

  /**
   * Make a request to resend the email confirmation link for the currently logged-in user
   *
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  resendEmailConfirmationLink() {
    return ax
      .get("/auth/me/resendEmailConfirmationLink")
      .then((res) => res.data);
  }
}

export default new AuthService();
