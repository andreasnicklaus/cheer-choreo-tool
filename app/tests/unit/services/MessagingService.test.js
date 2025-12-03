import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import MessagingService from "@/services/MessagingService";

describe("MessagingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("subscribe", () => {
    test("should subscribe to a topic", async () => {
      const mockHandler = jest.fn();
      await MessagingService.subscribe("test-topic", mockHandler);

      expect(MessagingService.handlers).toEqual({ "test-topic": mockHandler });
    });
  });

  describe("_showMessage", () => {
    test("should show a message with the correct topic and data", () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["test-topic"] = mockHandler;

      MessagingService._showMessage("test-message", {});

      expect(mockHandler).toHaveBeenCalledWith("test-message", {
        variant: "info",
        title: "Info",
        solid: true,
      });
    });

    test("should pass options to the handler", () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["test-topic"] = mockHandler;

      MessagingService._showMessage("test-message", { title: "Custom Title" });

      expect(mockHandler).toHaveBeenCalledWith("test-message", {
        variant: "info",
        title: "Custom Title",
        solid: true,
      });
    });
  });

  describe("showSuccess", () => {
    test("should show a success message with default title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["success-topic"] = mockHandler;

      await MessagingService.showSuccess("Operation successful");

      expect(mockHandler).toHaveBeenCalledWith("Operation successful", {
        variant: "success",
        title: "Success",
        solid: true,
      });
    });

    test("should show a success message with custom title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["success-topic"] = mockHandler;

      await MessagingService.showSuccess(
        "Operation successful",
        "Custom Title"
      );

      expect(mockHandler).toHaveBeenCalledWith("Operation successful", {
        variant: "success",
        title: "Custom Title",
        solid: true,
      });
    });
  });

  describe("showInfo", () => {
    test("should show an info message with default title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["info-topic"] = mockHandler;

      await MessagingService.showInfo("This is an info message");

      expect(mockHandler).toHaveBeenCalledWith("This is an info message", {
        variant: "info",
        title: "Info",
        solid: true,
      });
    });

    test("should show an info message with custom title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["info-topic"] = mockHandler;

      await MessagingService.showInfo(
        "This is an info message",
        "Custom Title"
      );

      expect(mockHandler).toHaveBeenCalledWith("This is an info message", {
        variant: "info",
        title: "Custom Title",
        solid: true,
      });
    });
  });

  describe("showError", () => {
    test("should show an error message with default title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["error-topic"] = mockHandler;

      await MessagingService.showError("An error occurred", "Error");

      expect(mockHandler).toHaveBeenCalledWith("An error occurred", {
        variant: "danger",
        title: "Error",
        solid: true,
      });
    });

    test("should show an error message with custom title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["error-topic"] = mockHandler;

      await MessagingService.showError("An error occurred", "Custom Title");

      expect(mockHandler).toHaveBeenCalledWith("An error occurred", {
        variant: "danger",
        title: "Custom Title",
        solid: true,
      });
    });
  });

  describe("showWarning", () => {
    test("should show a warning message with default title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["warning-topic"] = mockHandler;

      await MessagingService.showWarning("This is a warning");

      expect(mockHandler).toHaveBeenCalledWith("This is a warning", {
        variant: "warning",
        title: "Warning",
        solid: true,
      });
    });

    test("should show a warning message with custom title", async () => {
      const mockHandler = jest.fn();
      MessagingService.handlers["warning-topic"] = mockHandler;

      await MessagingService.showWarning("This is a warning", "Custom Title");

      expect(mockHandler).toHaveBeenCalledWith("This is a warning", {
        variant: "warning",
        title: "Custom Title",
        solid: true,
      });
    });
  });
});
