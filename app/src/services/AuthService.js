import router from "@/router";
import ax from "./RequestService";
import store from "@/store";
import i18n from "@/plugins/vue-i18n";
import { debug, error, warn } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

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
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @returns {Boolean} Returns true if the login was successful, otherwise throws an error
   */
  async login(username, password) {
    debug("Attempting login", { username, password: "<redacted>" });
    return ax
      .post("/auth/login", { username, password })
      .then((res) => {
        const token = res.data;
        if (!token) {
          store.commit("setLoginState", false);
          warn("Requested authentication token, but did not receive a token");
          throw new Error("No token received");
        }

        debug("Succesfully logged in as", username);
        localStorage.setItem(tokenStorageKey, token);
        store.commit("setLoginState", true);
        return true;
      })
      .catch((e) => {
        error(e, ERROR_CODES.LOGIN_FAILED);
        store.commit("setLoginState", false);
        throw e;
      });
  }

  /**
   * Make a login request with an SSO token and store the authentication token
   *
   * @async
   * @param {string} ssoToken - The SSO token received from the SSO provider
   * @returns {Boolean} Returns true if the login was successful, otherwise throws an error
   */
  async ssoLogin(ssoToken) {
    debug("Attempting SSO login with token");
    return ax
      .post("/auth/sso", { ssoToken })
      .then((res) => {
        const token = res.data;
        if (!token) {
          store.commit("setLoginState", false);
          warn(
            "Requested authentication token with SSO token, but did not receive an authentication token"
          );
          throw new Error("No token received");
        }

        debug("Successfully logged in with SSO token");
        localStorage.setItem(tokenStorageKey, token);
        store.commit("setLoginState", true);
        return true;
      })
      .catch((e) => {
        error(e, ERROR_CODES.SSO_LOGIN_FAILED);
        store.commit("setLoginState", false);
        throw e;
      });
  }

  /**
   * Request an SSO login link for the given email address.
   *
   * @async
   * @param {string} email - The email address to request the SSO link for
   * @returns {unknown} Returns the response data from the server
   */
  async requestSSO(email) {
    debug("Requesting SSO login link for mail address", email);
    return ax.post("/auth/ssoRequest", { email }).then((res) => res.data);
  }

  /**
   * Make a registration request with username, password, and email and store the authentication token
   *
   * @async
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @param {string} email - The email address of the user
   * @returns {Boolean} Returns true if the registration was successful, otherwise throws an error
   */
  async register(username, password, email) {
    debug("Attempting to register", {
      username,
      email,
      password: "<redacted>",
    });
    return ax
      .post("/auth", { username, password, email })
      .then((res) => {
        const token = res.data;
        if (!token) {
          store.commit("setLoginState", false);
          warn(
            "Requested authentication token through registration token, but did not receive one"
          );
          throw new Error("No token received");
        }

        debug("Successfully registered as", username);
        localStorage.setItem(tokenStorageKey, token);
        store.commit("setLoginState", true);
        return true;
      })
      .catch((e) => {
        error(e, ERROR_CODES.REGISTRATION_FAILED);
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
    debug("Logging out.");
    this.removeToken();
    store.commit("setLoginState", false);
    if (router.currentRoute.meta.private)
      router
        .push({ name: "Login", params: { locale: i18n.locale } })
        .catch(() => {
          error("Redundant navigation to login", ERROR_CODES.REDUNDANT_ROUTING);
        });
    debug("Successfully logged out");
  }

  /**
   * Make a request to change the password of the currently logged-in user
   *
   * @param {string} password - The new password to set for the user
   * @returns {unknown} Returns the response data from the server
   */
  changePassword(password) {
    debug("Changing password");
    return ax.put("/user", { password }).then((res) => {
      debug("Successfully changed password");
      return res.data;
    });
  }

  /**
   * Make a request to update the user information of the currently logged-in user
   *
   * @param {string} username - The new username to set for the user
   * @param {string} email - The new email address to set for the user
   * @returns {unknown} Returns the response data from the server
   */
  updateUserInfo(username, email) {
    debug("Updating user info", { username, email });
    return ax.put("/auth/me", { username, email }).then((res) => {
      debug("Successfully updated user information");
      return res.data;
    });
  }

  /**
   * Make a request to update the profile picture of the currently logged-in user
   *
   * @param {File} profilePicture - The new profile picture file to upload
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  updateProfilePicture(profilePicture) {
    debug("Updating profile picture");
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    return ax
      .put("/auth/me/profilePicture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        debug("Successfully updated profile picture");
        return res.data;
      });
  }

  /**
   * Make a request to delete the currently logged-in user account
   *
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  deleteAccount() {
    debug("Deleting user account");
    return ax.delete("/user").then((res) => {
      this.logout();
      debug("Successfully deleted user account");
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
   * @param {string} userId - The ID of the user whose profile image is requested
   * @param {string} extension - The file extension of the profile image (e.g., 'jpg', 'png')
   * @returns {Promise<string>} Returns a promise that resolves to the profile image blob
   */
  getProfileImage(userId, extension) {
    const profileImageUrl = `/auth/me/profilePicture/${userId}.${extension}`;
    debug("Querying profile image at", profileImageUrl);
    return ax.get(profileImageUrl, { responseType: "blob" });
  }

  /**
   * Make a request to delete the profile picture of the currently logged-in user
   *
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  deleteProfilePicture() {
    debug("Deleting profile picture");
    return ax.delete("/auth/me/profilePicture").then((res) => {
      debug("Successfully deleted profile picture");
      return res.data;
    });
  }

  /**
   * Make a request to resend the email confirmation link for the currently logged-in user
   *
   * @returns {Promise<unknown>} Returns the response data from the server
   */
  resendEmailConfirmationLink() {
    debug("Requesting the email confirmation email to be sent again");
    return ax.get("/auth/me/resendEmailConfirmationLink").then((res) => {
      debug("Successfully requesting resending of email confirmation email");
      return res.data;
    });
  }
}

export default new AuthService();
