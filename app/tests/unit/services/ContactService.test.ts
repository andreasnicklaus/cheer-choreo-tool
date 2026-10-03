import { test, expect, describe, vi, beforeEach } from "vitest";
import ContactService from "@/services/ContactService";
import ax from "@/services/RequestService";

vi.mock("@/services/RequestService", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("ContactService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createMessageAppendix", () => {
    test("should return best regards with username if username is given", () => {
      const result = ContactService.createMessageAppendix("John");
      expect(result).toBe("\nBest regards\nJohn");
    });

    test("should return best regards without username if no username is given", () => {
      const result = ContactService.createMessageAppendix();
      expect(result).toBe("\nBest regards!");
    });
  });

  describe("sendContactMessage", () => {
    test("should call post endpoint with contact message data", async () => {
      const mockResponse = { data: "Message received" };
      ax.post.mockResolvedValue(mockResponse);

      const contactData = {
        name: "John Doe",
        email: "test@choreo-planer.de",
        subject: "Test Subject",
        message: "Test Message",
        category: "General",
      };

      const result = await ContactService.sendContactMessage(contactData);

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/contact", contactData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      const contactData = {
        name: "John Doe",
        email: "test@choreo-planer.de",
        subject: "Test Subject",
        message: "Test Message",
        category: "General",
      };

      await expect(
        ContactService.sendContactMessage(contactData)
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/contact", contactData);
    });
  });
});
