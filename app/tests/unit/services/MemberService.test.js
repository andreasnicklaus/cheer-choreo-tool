import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";
import MemberService from "@/services/MemberService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("MemberService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should call post endpoint to create a member", async () => {
      const mockResponse = { data: { id: "1", name: "Member1" } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await MemberService.create("Member1");

      expect(ax.post).toHaveBeenCalledWith("/member", { name: "Member1" });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(MemberService.create("Member1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledWith("/member", { name: "Member1" });
    });
  });

  describe("update", () => {
    test("should call put endpoint to update a member", async () => {
      const mockResponse = { data: { id: "1", name: "UpdatedMember" } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await MemberService.update("1", { name: "UpdatedMember" });

      expect(ax.put).toHaveBeenCalledWith("/member/1", {
        name: "UpdatedMember",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if update request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        MemberService.update("1", { name: "UpdatedMember" })
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledWith("/member/1", {
        name: "UpdatedMember",
      });
    });
  });

  describe("remove", () => {
    test("should call delete endpoint to remove a member", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await MemberService.remove("1");

      expect(ax.delete).toHaveBeenCalledWith("/member/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if delete request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(MemberService.remove("1")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledWith("/member/1");
    });
  });
});
