import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";
import SeasonService from "@/services/SeasonService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("SeasonService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    test("should call get endpoint to retrieve current season", async () => {
      const mockResponse = { data: { id: "1", name: "2023 Season" } };
      ax.get.mockResolvedValue(mockResponse);

      const result = await SeasonService.getAll();

      expect(ax.get).toHaveBeenCalledWith("/season");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if get request fails", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(SeasonService.getAll()).rejects.toThrow("Network Error");

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    test("should call post endpoint to create a new season", async () => {
      const mockResponse = { data: { id: "2", name: "2024 Season" } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await SeasonService.create("2024 Season");

      expect(ax.post).toHaveBeenCalledWith("/season", { name: "2024 Season" });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(SeasonService.create("2024 Season")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledWith("/season", { name: "2024 Season" });
    });
  });
});
