import { describe, test, expect, vi, beforeEach } from "vitest";
import FeedbackService from "@/services/FeedbackService";
import ax from "@/services/RequestService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("FeedbackService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendFeedback", () => {
    test("should send feedback with stars and text", async () => {
      const mockResponse = { data: { success: true } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await FeedbackService.sendFeedback(5, "Great app!");

      expect(ax.post).toHaveBeenCalledWith("/feedback", {
        stars: 5,
        text: "Great app!",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(
        FeedbackService.sendFeedback(5, "Great app!")
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledWith("/feedback", {
        stars: 5,
        text: "Great app!",
      });
    });
  });

  describe("getAll", () => {
    test("should retrieve all feedback entries", async () => {
      const mockResponse = {
        data: [{ id: "1", stars: 5, text: "Great app!" }],
      };
      ax.get.mockResolvedValue(mockResponse);

      const result = await FeedbackService.getAll();

      expect(ax.get).toHaveBeenCalledWith("/feedback");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(FeedbackService.getAll()).rejects.toThrow("Network Error");

      expect(ax.get).toHaveBeenCalledWith("/feedback");
    });
  });
});
