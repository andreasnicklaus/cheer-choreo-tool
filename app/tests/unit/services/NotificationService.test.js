import { describe, test, expect, vi, beforeEach } from "vitest";
import ax from "@/services/RequestService";
import NotificationService from "@/services/NotificationService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    test("should retrieve all notifications", async () => {
      const mockResponse = {
        data: [{ id: "1", message: "Test Notification" }],
      };
      ax.get.mockResolvedValue(mockResponse);

      const result = await NotificationService.getAll();

      expect(ax.get).toHaveBeenCalledWith("/notifications");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if get request fails", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(NotificationService.getAll()).rejects.toThrow(
        "Network Error"
      );

      expect(ax.get).toHaveBeenCalledWith("/notifications");
    });
  });

  describe("markAsNotRead", () => {
    test("should call put endpoint to mark a notification as not read", async () => {
      const mockResponse = { data: { id: "1", read: false } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await NotificationService.markAsNotRead("1");

      expect(ax.post).toHaveBeenCalledWith("/notifications/1/unread");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if markAsNotRead request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(NotificationService.markAsNotRead("1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledWith("/notifications/1/unread");
    });
  });

  describe("markAsRead", () => {
    test("should call put endpoint to mark a notification as read", async () => {
      const mockResponse = { data: { id: "1", read: true } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await NotificationService.markAsRead("1");

      expect(ax.post).toHaveBeenCalledWith("/notifications/1/read");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if markAsRead request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(NotificationService.markAsRead("1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledWith("/notifications/1/read");
    });
  });

  describe("delete", () => {
    test("should call delete endpoint to remove a notification", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await NotificationService.delete("1");

      expect(ax.delete).toHaveBeenCalledWith("/notifications/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if delete request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(NotificationService.delete("1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.delete).toHaveBeenCalledWith("/notifications/1");
    });
  });
});
