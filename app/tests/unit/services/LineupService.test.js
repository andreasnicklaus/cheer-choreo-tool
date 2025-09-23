import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import LineupService from "@/services/LineupService";
import ax from "@/services/RequestService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("LineupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should call post endpoint to create a lineup", async () => {
      const mockResponse = { data: { id: "1", startCount: 1, endCount: 5 } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await LineupService.create(1, 5, "choreo1");

      expect(ax.post).toHaveBeenCalledWith("/lineup", {
        choreoId: "choreo1",
        endCount: 5,
        startCount: 1,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(LineupService.create(1, 5, "choreo1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    test("should call put endpoint to update a lineup", async () => {
      const mockResponse = { data: { id: "1", startCount: 2, endCount: 6 } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await LineupService.update("1", {
        startCount: 2,
        endCount: 6,
      });

      expect(ax.put).toHaveBeenCalledWith("/lineup/1", {
        startCount: 2,
        endCount: 6,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if update request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        LineupService.update("1", { startCount: 2, endCount: 6 })
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    test("should call delete endpoint to remove a lineup", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await LineupService.remove("1");

      expect(ax.delete).toHaveBeenCalledWith("/lineup/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if remove request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(LineupService.remove("1")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });
});
