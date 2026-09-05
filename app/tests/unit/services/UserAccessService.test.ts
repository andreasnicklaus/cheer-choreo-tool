import { describe, test, expect, vi, beforeEach } from "vitest";
import ax from "@/services/RequestService";
import UserAccessService from "@/services/UserAccessService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("UserAccessService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOwners", () => {
    test("should call get endpoint for owners", async () => {
      const mockResponse = {
        data: [{ id: "1", ownerUserId: "owner-1", childUserId: "child-1" }],
      };
      ax.get.mockResolvedValue(mockResponse);

      const result = await UserAccessService.getOwners();

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/user/access/owner");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(UserAccessService.getOwners()).rejects.toThrow(
        "Network Error"
      );
      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getChildren", () => {
    test("should call get endpoint for children", async () => {
      const mockResponse = {
        data: [{ id: "1", ownerUserId: "owner-1", childUserId: "child-1" }],
      };
      ax.get.mockResolvedValue(mockResponse);

      const result = await UserAccessService.getChildren();

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/user/access");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(UserAccessService.getChildren()).rejects.toThrow(
        "Network Error"
      );
      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("invite", () => {
    test("should call post endpoint to invite user", async () => {
      const mockResponse = {
        data: { id: "1", role: "athlete" },
      };
      ax.post.mockResolvedValue(mockResponse);

      const result = await UserAccessService.invite(
        "test@example.com",
        "coach"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/user/access", {
        childEmail: "test@example.com",
        role: "coach",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(
        UserAccessService.invite("test@example.com", "athlete")
      ).rejects.toThrow("Network Error");
      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    test("should call put endpoint to update access", async () => {
      const mockResponse = {
        data: { id: "1", role: "coach" },
      };
      ax.put.mockResolvedValue(mockResponse);

      const result = await UserAccessService.update("access-1", {
        role: "coach",
      });

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/user/access/access-1", {
        role: "coach",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        UserAccessService.update("access-1", { enabled: false })
      ).rejects.toThrow("Network Error");
      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    test("should call delete endpoint to remove access", async () => {
      const mockResponse = { data: null };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await UserAccessService.remove("access-1");

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith("/user/access/access-1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(UserAccessService.remove("access-1")).rejects.toThrow(
        "Network Error"
      );
      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("accept", () => {
    test("should call post endpoint to accept access", async () => {
      const mockResponse = {
        data: { id: "1", accepted: true },
      };
      ax.post.mockResolvedValue(mockResponse);

      const result = await UserAccessService.accept("access-1");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/user/access/access-1/accept");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(UserAccessService.accept("access-1")).rejects.toThrow(
        "Network Error"
      );
      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("decline", () => {
    test("should call post endpoint to decline access", async () => {
      const mockResponse = { data: null };
      ax.post.mockResolvedValue(mockResponse);

      const result = await UserAccessService.decline("access-1");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/user/access/access-1/decline");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(UserAccessService.decline("access-1")).rejects.toThrow(
        "Network Error"
      );
      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });
});
