import { describe, test, expect, vi, beforeEach } from "vitest";
import MessagingService from "@/services/MessagingService";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribe", () => {
    test("should subscribe to a topic", async () => {
      const mockHandler = vi.fn();
      await MessagingService.subscribe("test-topic", mockHandler);

      expect(MessagingService.handlers).toEqual({ "test-topic": mockHandler });
    });
  });

  describe("_showMessage", () => {
    test("should show a message with the correct topic and data", () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["test-topic"] = mockHandler;

      MessagingService._showMessage("test-message", {});

      expect(mockHandler).toHaveBeenCalledWith("test-message", {
        modelValue: 5_000,
        solid: false,
      });
    });

    test("should pass options to the handler", () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["test-topic"] = mockHandler;

      MessagingService._showMessage("test-message", { title: "Custom Title" });

      expect(mockHandler).toHaveBeenCalledWith("test-message", {
        modelValue: 5_000,
        solid: false,
        title: "Custom Title",
      });
    });
  });

  describe("showSuccess", () => {
    test("should show a success message with default title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["success-topic"] = mockHandler;

      await MessagingService.showSuccess("Operation successful");

      expect(mockHandler).toHaveBeenCalledWith("Operation successful", {
        variant: "success",
        title: "Success",
        modelValue: 5_000,
        solid: false,
        progressProps: { variant: "success" },
      });
    });

    test("should show a success message with custom title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["success-topic"] = mockHandler;

      await MessagingService.showSuccess(
        "Operation successful",
        "Custom Title"
      );

      expect(mockHandler).toHaveBeenCalledWith("Operation successful", {
        variant: "success",
        title: "Custom Title",
        modelValue: 5_000,
        solid: false,
        progressProps: { variant: "success" },
      });
    });
  });

  describe("showInfo", () => {
    test("should show an info message with default title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["info-topic"] = mockHandler;

      await MessagingService.showInfo("This is an info message");

      expect(mockHandler).toHaveBeenCalledWith("This is an info message", {
        title: "Info",
        modelValue: 5_000,
        solid: false,
      });
    });

    test("should show an info message with custom title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["info-topic"] = mockHandler;

      await MessagingService.showInfo(
        "This is an info message",
        "Custom Title"
      );

      expect(mockHandler).toHaveBeenCalledWith("This is an info message", {
        title: "Custom Title",
        modelValue: 5_000,
        solid: false,
      });
    });
  });

  describe("showError", () => {
    test("should show an error message with default title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["error-topic"] = mockHandler;

      await MessagingService.showError("An error occurred", "Error");

      expect(mockHandler).toHaveBeenCalledWith("An error occurred", {
        variant: "danger",
        title: "Error",
        modelValue: 5_000,
        solid: false,
        progressProps: { variant: "danger" },
      });
    });

    test("should show an error message with custom title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["error-topic"] = mockHandler;

      await MessagingService.showError("An error occurred", "Custom Title");

      expect(mockHandler).toHaveBeenCalledWith("An error occurred", {
        variant: "danger",
        title: "Custom Title",
        modelValue: 5_000,
        solid: false,
        progressProps: { variant: "danger" },
      });
    });
  });

  describe("showWarning", () => {
    test("should show a warning message with default title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["warning-topic"] = mockHandler;

      await MessagingService.showWarning("This is a warning");

      expect(mockHandler).toHaveBeenCalledWith("This is a warning", {
        variant: "warning",
        title: "Warning",
        modelValue: 5_000,
        solid: false,
        progressProps: { variant: "warning" },
      });
    });

    test("should show a warning message with custom title", async () => {
      const mockHandler = vi.fn();
      MessagingService.handlers["warning-topic"] = mockHandler;

      await MessagingService.showWarning("This is a warning", "Custom Title");

      expect(mockHandler).toHaveBeenCalledWith("This is a warning", {
        variant: "warning",
        title: "Custom Title",
        modelValue: 5_000,
        solid: false,
        progressProps: { variant: "warning" },
      });
    });
  });
});
