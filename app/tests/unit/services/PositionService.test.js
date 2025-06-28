import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";
import PositionService from "@/services/PositionService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("PositionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should call post endpoint to create a position", async () => {
      const mockResponse = { data: { id: "1", name: "Position1" } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await PositionService.create(
        "test-lineupId",
        0,
        1,
        "test-memberId"
      );

      expect(ax.post).toHaveBeenCalledWith("/lineup/test-lineupId/position", {
        memberId: "test-memberId",
        x: 0,
        y: 1,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(
        PositionService.create("test-lineupId", 0, 1, "test-memberId")
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledWith("/lineup/test-lineupId/position", {
        memberId: "test-memberId",
        x: 0,
        y: 1,
      });
    });
  });

  describe("getByLineupId", () => {
    test("should retrieve positions by lineup ID", async () => {
      const mockResponse = { data: [{ id: "1", name: "Position1" }] };
      ax.get.mockResolvedValue(mockResponse);

      const result = await PositionService.getByLineupId("lineup1");

      expect(ax.get).toHaveBeenCalledWith("/position", {
        params: { lineupId: "lineup1" },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if getByLineupId request fails", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(PositionService.getByLineupId("lineup1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.get).toHaveBeenCalledWith("/position", {
        params: { lineupId: "lineup1" },
      });
    });
  });

  describe("update", () => {
    test("should call put endpoint to update a position", async () => {
      const mockResponse = { data: { id: "1", name: "UpdatedPosition" } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await PositionService.update("1", "2", 0, 1);

      expect(ax.put).toHaveBeenCalledWith("/lineup/1/position/2", {
        x: 0,
        y: 1,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if update request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(PositionService.update("1", "2", 0, 1)).rejects.toThrow(
        "Network Error"
      );

      expect(ax.put).toHaveBeenCalledWith("/lineup/1/position/2", {
        x: 0,
        y: 1,
      });
    });
  });

  describe("remove", () => {
    test("should call delete endpoint to remove a position", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await PositionService.remove("1");

      expect(ax.delete).toHaveBeenCalledWith("/position/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if remove request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(PositionService.remove("1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.delete).toHaveBeenCalledWith("/position/1");
    });
  });
});
