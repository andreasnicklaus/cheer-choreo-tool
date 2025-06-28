import {
  test,
  expect,
  jest,
  beforeEach,
  beforeAll,
  afterAll,
} from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";
import VersionService from "@/services/VersionService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("VersionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    VersionService.resetCache();
  });

  describe("getServerVersion", () => {
    test("should retrieve the server version", async () => {
      const mockResponse = { data: "1.0.0" };
      ax.get.mockResolvedValue(mockResponse);

      const result = await VersionService.getServerVersion();

      expect(ax.get).toHaveBeenCalledWith("/version");
      expect(result).toEqual(mockResponse.data);
    });

    test("should return null if request fails", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(VersionService.getServerVersion()).resolves.toBeNull();

      expect(ax.get).toHaveBeenCalledWith("/version");
    });
    test("should return cached value on second request", async () => {
      ax.get.mockResolvedValueOnce({ data: "1.0.0" });
      const firstResult = await VersionService.getServerVersion();
      expect(firstResult).toEqual("1.0.0");

      ax.get.mockResolvedValueOnce({ data: "1.0.1" });
      const secondResult = await VersionService.getServerVersion();
      expect(secondResult).toEqual("1.0.0");
    });
  });

  describe("getAppVersion", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules(); // Most important - it clears the cache
      process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
      process.env = OLD_ENV; // Restore old environment
    });

    test("should retrieve the app version from environment variable", () => {
      process.env.VUE_APP_VERSION = "1.0.0";

      const result = VersionService.getAppVersion();

      expect(result).toBe("1.0.0");
    });
  });

  describe("isVersionNew", () => {
    beforeAll(() => {
      jest.useFakeTimers("modern");
    });
    afterAll(() => {
      jest.useRealTimers();
    });
    test("should return true if app version is within tag time range", () => {
      jest.setSystemTime(new Date(2025, 6, 15));
      const result = VersionService.isVersionNew("0.10.3");
      expect(result).toBeTruthy();
    });

    test("should return false if app version is outside of tag time range", () => {
      jest.setSystemTime(new Date(2025, 6, 16));
      const result = VersionService.isVersionNew("0.10.3");
      expect(result).toBeFalsy();
    });

    test("should return false if version tag is unknown", () => {
      const result = VersionService.isVersionNew("unknown-tag");
      expect(result).toBeFalsy();
    });
  });
});
