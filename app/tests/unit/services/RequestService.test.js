import { describe, test, expect, vi, beforeEach } from "vitest";
import AuthService from "@/services/AuthService";
import store from "@/store";
import router from "@/router";
import i18n from "@/plugins/vue-i18n";
import { logRequest, error as logError } from "@/utils/logging";
import { getApiDomain } from "@/services/RequestService";
import env from "@/utils/env";

vi.mock("axios", () => {
  const requestInterceptors = [];
  const responseInterceptors = [];

  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: (fulfilled, rejected) => {
          requestInterceptors.push({ fulfilled, rejected });
        },
      },
      response: {
        use: (fulfilled, rejected) => {
          responseInterceptors.push({ fulfilled, rejected });
        },
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    __requestInterceptors: requestInterceptors,
    __responseInterceptors: responseInterceptors,
    __mockAxiosInstance: mockAxiosInstance,
  };
});

vi.mock("axios-cache-interceptor", () => ({
  setupCache: vi.fn((instance) => instance),
}));

vi.mock("@/services/AuthService", () => ({
  default: {
    getAuthToken: vi.fn(),
    removeToken: vi.fn(),
  },
}));

vi.mock("@/store", () => ({
  default: {
    commit: vi.fn(),
  },
}));

vi.mock("@/router", () => ({
  default: {
    push: vi.fn(),
  },
}));

vi.mock("@/plugins/vue-i18n", () => ({
  default: {
    global: {
      locale: {
        value: "en",
      },
    },
  },
}));

vi.mock("@/utils/logging", () => ({
  logRequest: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/utils/env", () => ({
  default: {
    PROD: false,
  },
}));

const axios = await import("axios");

describe("RequestService", () => {
  let requestInterceptors;
  let responseInterceptors;

  beforeEach(() => {
    vi.clearAllMocks();
    requestInterceptors = axios.__requestInterceptors;
    responseInterceptors = axios.__responseInterceptors;
    i18n.global.locale.value = "en";
  });

  const runRequestInterceptors = async (config) => {
    let result = { ...config };
    for (const interceptor of requestInterceptors) {
      if (interceptor.fulfilled) {
        result = await interceptor.fulfilled(result);
      }
    }
    return result;
  };

  const runResponseSuccessInterceptor = async (response) => {
    for (const interceptor of responseInterceptors) {
      if (interceptor.fulfilled) {
        return await interceptor.fulfilled(response);
      }
    }
    return response;
  };

  const runResponseErrorInterceptor = async (error) => {
    for (const interceptor of responseInterceptors) {
      if (interceptor.rejected) {
        try {
          return await interceptor.rejected(error);
        } catch (e) {
          throw e;
        }
      }
    }
    throw error;
  };

  describe("request interceptors", () => {
    test("should add Authorization header when token exists", async () => {
      AuthService.getAuthToken.mockReturnValue("test-token");
      const config = { url: "/test", headers: {} };
      const result = await runRequestInterceptors(config);
      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    test("should not add Authorization header when no token exists", async () => {
      AuthService.getAuthToken.mockReturnValue(null);
      const config = { url: "/test", headers: {} };
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      await runRequestInterceptors(config);
      expect(consoleSpy).toHaveBeenCalledWith("No auth token found", "/test");
      consoleSpy.mockRestore();
    });

    test("should add Accept-Language header when locale exists", async () => {
      AuthService.getAuthToken.mockReturnValue(null);
      i18n.global.locale.value = "de";
      const config = { url: "/test", headers: {} };
      const result = await runRequestInterceptors(config);
      expect(result.headers["Accept-Language"]).toBe("de");
    });

    test("should set requestStarted timestamp", async () => {
      AuthService.getAuthToken.mockReturnValue(null);
      const config = { url: "/test", headers: {} };
      const result = await runRequestInterceptors(config);
      expect(result.requestStarted).toBeDefined();
      expect(typeof result.requestStarted).toBe("number");
    });
  });

  describe("response interceptors - success", () => {
    test("should call logRequest and return response", async () => {
      const now = Date.now();
      const response = {
        status: 200,
        config: {
          url: "/test-endpoint",
          requestStarted: now - 100,
        },
      };
      const result = await runResponseSuccessInterceptor(response);
      expect(logRequest).toHaveBeenCalledWith(200, expect.any(Number), "/test-endpoint");
      expect(result).toEqual(response);
    });
  });

  describe("response interceptors - error", () => {
    test("should handle network error (no response status)", async () => {
      const error = {
        config: {
          url: "/test",
          requestStarted: Date.now() - 50,
        },
      };

      await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error);
      expect(AuthService.removeToken).toHaveBeenCalled();
      expect(store.commit).toHaveBeenCalledWith("setLoginState", false);
    });

    test("should handle 401 error with Authorization header", async () => {
      const error = {
        response: { status: 401 },
        config: {
          url: "/test",
          headers: { Authorization: "Bearer test-token" },
          requestStarted: Date.now() - 50,
        },
      };

      router.push.mockResolvedValue();

      await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error);
      expect(AuthService.removeToken).toHaveBeenCalled();
      expect(store.commit).toHaveBeenCalledWith("setLoginState", false);
      expect(router.push).toHaveBeenCalledWith({
        name: "Login",
        params: { locale: "en" },
      });
    });

    test("should handle 401 error without Authorization header", async () => {
      const error = {
        response: { status: 401 },
        config: {
          url: "/test",
          headers: {},
          requestStarted: Date.now() - 50,
        },
      };

      router.push.mockResolvedValue();

      await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error);
      expect(AuthService.removeToken).not.toHaveBeenCalled();
      expect(store.commit).not.toHaveBeenCalled();
    });

    test("should handle 401 with skipRoutingToLogin", async () => {
      const error = {
        response: { status: 401 },
        config: {
          url: "/test",
          headers: { Authorization: "Bearer test-token" },
          skipRoutingToLogin: true,
          requestStarted: Date.now() - 50,
        },
      };

      await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error);
      expect(router.push).not.toHaveBeenCalled();
    });

    test("should handle 401 with router.push rejection", async () => {
      const error = {
        response: { status: 401 },
        config: {
          url: "/test",
          headers: { Authorization: "Bearer test-token" },
          requestStarted: Date.now() - 50,
        },
      };

      router.push.mockRejectedValue(new Error("Navigation failed"));

      await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error);
      expect(logError).toHaveBeenCalledWith(
        "Redundant navigation to login",
        expect.anything()
      );
    });

    test("should handle 403 error with Authorization header", async () => {
      const error = {
        response: { status: 403 },
        config: {
          url: "/test",
          headers: { Authorization: "Bearer test-token" },
          requestStarted: Date.now() - 50,
        },
      };

      router.push.mockResolvedValue();

      await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error);
      expect(AuthService.removeToken).toHaveBeenCalled();
      expect(store.commit).toHaveBeenCalledWith("setLoginState", false);
      expect(router.push).toHaveBeenCalled();
    });

    test("should handle other error statuses (404, 500)", async () => {
      const error404 = {
        response: { status: 404 },
        config: {
          url: "/test",
          headers: { Authorization: "Bearer test-token" },
          requestStarted: Date.now() - 50,
        },
      };

      await expect(runResponseErrorInterceptor(error404)).rejects.toEqual(error404);
      expect(AuthService.removeToken).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();

      const error500 = {
        response: { status: 500 },
        config: {
          url: "/test",
          requestStarted: Date.now() - 50,
        },
      };

      await expect(runResponseErrorInterceptor(error500)).rejects.toEqual(error500);
    });
  });

  describe("getApiDomain", () => {
    test("should return production domain when PROD is true", () => {
      vi.mocked(env).PROD = true;
      expect(getApiDomain()).toBe("https://api.choreo-planer.de/");
    });

    test("should return localhost domain when PROD is false", () => {
      vi.mocked(env).PROD = false;
      expect(getApiDomain()).toBe("http://localhost:3000/");
    });
  });
});
