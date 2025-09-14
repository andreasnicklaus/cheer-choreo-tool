import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import HitService from "@/services/HitService";
import ax from "@/services/RequestService";
jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("HitService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should call create endpoint for Hit", async () => {
      const mockResponse = { data: { id: "1", name: "Hit1", count: 10 } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await HitService.create("Hit1", 10, "choreo1", [
        "member1",
      ]);

      expect(ax.post).toHaveBeenCalledWith("/hit", {
        name: "Hit1",
        count: 10,
        choreoId: "choreo1",
        MemberIds: ["member1"],
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(
        HitService.create("Hit1", 10, "choreo1", ["member1"])
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledWith("/hit", {
        name: "Hit1",
        count: 10,
        choreoId: "choreo1",
        MemberIds: ["member1"],
      });
    });
  });

  describe("setCount", () => {
    test("should call put endpoint for Hit", async () => {
      const mockResponse = { data: { id: "1", count: 20 } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await HitService.setCount("hit1", 20);

      expect(ax.put).toHaveBeenCalledWith("/hit/hit1", { count: 20 });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if setCount request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(HitService.setCount("hit1", 20)).rejects.toThrow(
        "Network Error"
      );

      expect(ax.put).toHaveBeenCalledWith("/hit/hit1", { count: 20 });
    });
  });

  describe("update", () => {
    test("should call put endpoint for Hit", async () => {
      const mockResponse = { data: { id: "1", name: "UpdatedHit", count: 15 } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await HitService.update("hit1", "UpdatedHit", 15, [
        "member2",
      ]);

      expect(ax.put).toHaveBeenCalledWith("/hit/hit1", {
        name: "UpdatedHit",
        count: 15,
        MemberIds: ["member2"],
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if update request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        HitService.update("hit1", "UpdatedHit", 15, ["member2"])
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledWith("/hit/hit1", {
        name: "UpdatedHit",
        count: 15,
        MemberIds: ["member2"],
      });
    });
  });

  describe("remove", () => {
    test("should call delete endpoint for Hit", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await HitService.remove("hit1");

      expect(ax.delete).toHaveBeenCalledWith("/hit/hit1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if remove request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(HitService.remove("hit1")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledWith("/hit/hit1");
    });
  });
});
