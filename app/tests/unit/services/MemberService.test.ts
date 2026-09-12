import { describe, test, expect, vi, beforeEach } from "vitest";
import ax from "@/services/RequestService";
import MemberService from "@/services/MemberService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("MemberService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
