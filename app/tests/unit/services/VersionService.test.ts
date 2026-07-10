import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import ax from "@/services/RequestService";
import VersionService from "@/services/VersionService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("VersionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    beforeEach(() => {
      vi.resetModules(); // Most important - it clears the cache
      vi.unstubAllEnvs();
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    test("should retrieve the app version from environment variable", () => {
      vi.stubEnv("VITE_VERSION", "1.0.0");

      const result = VersionService.getAppVersion();

      expect(result).toBe("1.0.0");
    });
  });

  describe("isVersionNew", () => {
    beforeAll(() => {
      vi.useFakeTimers("modern");
    });
    afterAll(() => {
      vi.useRealTimers();
    });
    test("should return true if app version is within tag time range", () => {
      vi.setSystemTime(new Date(2025, 6, 15));
      const result = VersionService.isVersionNew("0.10.3");
      expect(result).toBeTruthy();
    });

    test("should return false if app version is outside of tag time range", () => {
      vi.setSystemTime(new Date(2025, 6, 16));
      const result = VersionService.isVersionNew("0.10.3");
      expect(result).toBeFalsy();
    });

    test("should return false if version tag is unknown", () => {
      const result = VersionService.isVersionNew("unknown-tag");
      expect(result).toBeFalsy();
    });
  });
});
