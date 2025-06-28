import { test, expect, beforeEach, jest } from "@jest/globals";
import { describe } from "node:test";

import AuthService from "@/services/AuthService";
import store from "@/store";
import ax from "@/services/RequestService";
import router from "@/router";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe("AuthService", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("logout", () => {
    test("should clear localStorage", () => {
      localStorage.setItem("choreo-planer-token", "test-token");
      AuthService.logout();
      expect(localStorage.getItem("choreo-planer-token")).toBeNull();
      expect(AuthService.getAuthToken()).toBeNull();
    });
    test("should route if the current route is private", () => {
      router.currentRoute.meta.private = true;
      const mockPushRoute = jest.spyOn(router, "push");
      AuthService.logout();
      expect(mockPushRoute).toHaveBeenCalledTimes(1);
    });
  });

  describe("login", () => {
    test("should call the login endpoint and store the token", async () => {
      ax.post.mockResolvedValue({
        data: "test-token",
        status: 200,
      });

      const returnValue = await AuthService.login("testuser", "testpassword");

      expect(returnValue).toBeTruthy();
      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/auth/login", {
        username: "testuser",
        password: "testpassword",
      });

      expect(localStorage.getItem("choreo-planer-token")).toBe("test-token");
      expect(store.state.loggedIn).toBeTruthy();
      expect(AuthService.getAuthToken()).toBe("test-token");
    });

    test("should handle missing auth token", async () => {
      ax.post.mockResolvedValue({
        data: null,
        status: 200,
      });

      await expect(
        AuthService.login("testuser", "wrongpassword")
      ).rejects.toThrow("No token received");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(store.state.loggedIn).toBeFalsy();
      expect(AuthService.getAuthToken()).toBeNull();
    });

    test("should throw error on login request failure", async () => {
      ax.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        AuthService.login("testuser", "wrongpassword")
      ).rejects.toThrow("Request failed");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(store.state.loggedIn).toBeFalsy();
      expect(AuthService.getAuthToken()).toBeNull();
    });
  });

  describe("ssoLogin", () => {
    test("should call the SSO login endpoint and store the token", async () => {
      ax.post.mockResolvedValue({
        data: "sso-test-token",
        status: 200,
      });

      const returnValue = await AuthService.ssoLogin("testToken");

      expect(returnValue).toBeTruthy();
      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/auth/sso", {
        ssoToken: "testToken",
      });

      expect(localStorage.getItem("choreo-planer-token")).toBe(
        "sso-test-token"
      );
      expect(store.state.loggedIn).toBeTruthy();
      expect(AuthService.getAuthToken()).toBe("sso-test-token");
    });

    test("should handle missing SSO auth token", async () => {
      ax.post.mockResolvedValue({
        data: null,
        status: 200,
      });

      await expect(AuthService.ssoLogin("testuser")).rejects.toThrow(
        "No token received"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(store.state.loggedIn).toBeFalsy();
      expect(AuthService.getAuthToken()).toBeNull();
    });

    test("should throw error on SSO login request failure", async () => {
      ax.post.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.ssoLogin("testuser")).rejects.toThrow(
        "Request failed"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(store.state.loggedIn).toBeFalsy();
      expect(AuthService.getAuthToken()).toBeNull();
    });
  });

  describe("requestSSO", () => {
    test("should call the SSO request endpoint", async () => {
      ax.post.mockResolvedValue({
        status: 200,
      });

      await AuthService.requestSSO("test-email");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/auth/ssoRequest", {
        email: "test-email",
      });
    });

    test("should throw error on SSO request failure", async () => {
      ax.post.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.requestSSO()).rejects.toThrow("Request failed");

      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("register", () => {
    test("should call the registration endpoint and store the token", async () => {
      ax.post.mockResolvedValue({
        data: "register-test-token",
        status: 200,
      });

      const returnValue = await AuthService.register(
        "newuser",
        "newpassword",
        "test-email"
      );

      expect(returnValue).toBeTruthy();
      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/auth", {
        username: "newuser",
        password: "newpassword",
        email: "test-email",
      });
      expect(localStorage.getItem("choreo-planer-token")).toBe(
        "register-test-token"
      );
      expect(store.state.loggedIn).toBeTruthy();
      expect(AuthService.getAuthToken()).toBe("register-test-token");
    });

    test("should handle missing registration token", async () => {
      ax.post.mockResolvedValue({
        data: null,
        status: 200,
      });

      await expect(
        AuthService.register("newuser", "newpassword", "test-email")
      ).rejects.toThrow("No token received");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(store.state.loggedIn).toBeFalsy();
      expect(AuthService.getAuthToken()).toBeNull();
    });

    test("should throw error on registration request failure", async () => {
      ax.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        AuthService.register("newuser", "newpassword", "test-email")
      ).rejects.toThrow("Request failed");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(store.state.loggedIn).toBeFalsy();
      expect(AuthService.getAuthToken()).toBeNull();
    });
  });

  describe("changePassword", () => {
    test("should call the change password endpoint", async () => {
      ax.put.mockResolvedValue({
        status: 200,
      });

      await AuthService.changePassword("newPassword");

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/user", {
        password: "newPassword",
      });
    });

    test("should throw error on change password request failure", async () => {
      ax.put.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.changePassword("newPassword")).rejects.toThrow(
        "Request failed"
      );

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateUserInfo", () => {
    test("should call the update user info endpoint", async () => {
      ax.put.mockResolvedValue({
        status: 200,
      });

      await AuthService.updateUserInfo("newUsername", "newEmail");

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/auth/me", {
        username: "newUsername",
        email: "newEmail",
      });
    });

    test("should throw error on update user info request failure", async () => {
      ax.put.mockRejectedValue(new Error("Request failed"));

      await expect(
        AuthService.updateUserInfo("newUsername", "newEmail")
      ).rejects.toThrow("Request failed");

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateProfilePicture", () => {
    test("should call the update profile picture endpoint", async () => {
      const mockFile = new File(["content"], "profile.jpg", {
        type: "image/jpeg",
      });
      const mockFormData = new FormData();
      mockFormData.append("profilePicture", mockFile);
      ax.put.mockResolvedValue({
        status: 200,
      });

      await AuthService.updateProfilePicture(mockFile);

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith(
        "/auth/me/profilePicture",
        mockFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    });

    test("should throw error on update profile picture request failure", async () => {
      const mockFile = new File(["content"], "profile.jpg", {
        type: "image/jpeg",
      });
      ax.put.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.updateProfilePicture(mockFile)).rejects.toThrow(
        "Request failed"
      );

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAccount", () => {
    test("should call the delete account endpoint and call logout", async () => {
      const logoutSpy = jest
        .spyOn(AuthService, "logout")
        .mockImplementation(() => {});
      ax.delete.mockResolvedValue({
        status: 200,
      });

      await AuthService.deleteAccount();

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith("/user");

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    test("should throw error on delete account request failure", async () => {
      ax.delete.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.deleteAccount()).rejects.toThrow(
        "Request failed"
      );

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAuthToken", () => {
    test("should return the auth token from localStorage", () => {
      localStorage.setItem("choreo-planer-token", "test-token");
      expect(AuthService.getAuthToken()).toBe("test-token");
    });

    test("should return null if no auth token is stored", () => {
      expect(AuthService.getAuthToken()).toBeNull();
    });
  });

  describe("removeToken", () => {
    test("should remove the auth token from localStorage", () => {
      localStorage.setItem("choreo-planer-token", "test-token");
      AuthService.removeToken();
      expect(localStorage.getItem("choreo-planer-token")).toBeNull();
    });
  });

  describe("getUserInfo", () => {
    test("should call the get user info endpoint", async () => {
      ax.get.mockResolvedValue({
        data: { username: "testuser", email: "test-email" },
      });

      const userInfo = await AuthService.getUserInfo();

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/auth/me");
      expect(userInfo).toEqual({ username: "testuser", email: "test-email" });
    });

    test("should throw error on get user info request failure", async () => {
      ax.get.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.getUserInfo()).rejects.toThrow("Request failed");

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProfileImage", () => {
    test("should call the get user profile picture endpoint", async () => {
      ax.get.mockResolvedValue("profile-picture-url");

      const profilePicture = await AuthService.getProfileImage(
        "test-user-id",
        "png"
      );

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith(
        "/auth/me/profilePicture/test-user-id.png",
        { responseType: "blob" }
      );
      expect(profilePicture).toBe("profile-picture-url");
    });

    test("should throw error on get user profile picture request failure", async () => {
      ax.get.mockRejectedValue(new Error("Request failed"));

      await expect(
        AuthService.getProfileImage(("test-user-id", "png"))
      ).rejects.toThrow("Request failed");

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteProfilePicture", () => {
    test("should call the delete profile picture endpoint", async () => {
      ax.delete.mockResolvedValue({
        data: "Profile picture deleted",
        status: 200,
      });

      const response = await AuthService.deleteProfilePicture();

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith("/auth/me/profilePicture");
      expect(response).toBe("Profile picture deleted");
    });

    test("should throw error on delete profile picture request failure", async () => {
      ax.delete.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.deleteProfilePicture()).rejects.toThrow(
        "Request failed"
      );

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("resendEmailConfirmationLink", () => {
    test("should call the resend email confirmation link endpoint", async () => {
      ax.get.mockResolvedValue({
        data: "Email confirmation link sent",
        status: 200,
      });

      const response = await AuthService.resendEmailConfirmationLink();

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith(
        "/auth/me/resendEmailConfirmationLink"
      );
      expect(response).toBe("Email confirmation link sent");
    });

    test("should throw error on resend email confirmation link request failure", async () => {
      ax.get.mockRejectedValue(new Error("Request failed"));

      await expect(AuthService.resendEmailConfirmationLink()).rejects.toThrow(
        "Request failed"
      );

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });
});
