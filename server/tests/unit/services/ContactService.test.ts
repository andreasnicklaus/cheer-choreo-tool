import ContactService from "@/services/ContactService";
import MailService from "@/services/MailService";
import UserService from "@/services/UserService";
import { describe, test, expect } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

jest.mock("@/plugins/nodemailer", () => ({
  sendMail: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
}));

jest.mock("i18n", () => ({
  __: jest.fn().mockReturnValue("i18nTranslation"),
  configure: jest.fn(),
}));

jest.mock("@/services/MailService", () => ({
  sendContactMessage: jest.fn().mockResolvedValue(true),
  sendContactNotification: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/services/UserService", () => ({
  findById: jest
    .fn()
    .mockResolvedValue({ id: "test-user-id", username: "test-user" }),
}));

describe("ContactService", () => {
  test("sendMessage sends 2 messages and returns success message without UserId", async () => {
    const result = await ContactService.sendMessage(
      "Test User",
      "Test Email",
      "Test Subject",
      "Test Message",
      "Test Category",
      "en",
    );
    expect(MailService.sendContactMessage).toHaveBeenCalledTimes(1);
    expect(MailService.sendContactMessage).toHaveBeenCalledWith(
      "Test User",
      "Test Email",
      "Test Subject",
      "Test Message",
      "Test Category",
      null,
      "en",
    );
    expect(MailService.sendContactNotification).toHaveBeenCalledTimes(1);
    expect(result).toBe("Message received");
  });

  test("sendMessage sends 2 messages and returns success message with UserId", async () => {
    const result = await ContactService.sendMessage(
      "Test User",
      "Test Email",
      "Test Subject",
      "Test Message",
      "Test Category",
      "en",
      "test-user-id",
    );
    expect(UserService.findById).toHaveBeenCalledTimes(1);
    expect(MailService.sendContactMessage).toHaveBeenCalledTimes(1);
    expect(MailService.sendContactMessage).toHaveBeenCalledWith(
      "Test User",
      "Test Email",
      "Test Subject",
      "Test Message",
      "Test Category",
      expect.objectContaining({ username: "test-user" }),
      "en",
    );
    expect(MailService.sendContactNotification).toHaveBeenCalledTimes(1);
    expect(result).toBe("Message received");
  });

  test("sendMessage throws error when MailService fails", async () => {
    (MailService.sendContactMessage as jest.Mock).mockRejectedValueOnce(
      new Error("Mail error"),
    );
    await expect(
      ContactService.sendMessage(
        "Test User",
        "Test Email",
        "Test Subject",
        "Test Message",
        "Test Category",
        "en",
      ),
    ).rejects.toThrow("Failed to send message: Mail error");
  });

  test("sendMessage does not throw error when UserService fails", async () => {
    (UserService.findById as jest.Mock).mockRejectedValueOnce(
      new Error("User not found"),
    );
    expect(
      ContactService.sendMessage(
        "Test User",
        "Test Email",
        "Test Subject",
        "Test Message",
        "Test Category",
        "en",
        "invalid-user-id",
      ),
    ).resolves.not.toThrow();
  });
});
