import { describe, test, expect } from "@jest/globals";
process.env.EMAIL_ADMIN_ADDRESSES = "admin@example.com";
import MailService from "@/services/MailService";
import { sendMail } from "@/plugins/nodemailer";
import { timeStringToMillis } from "@/utils/time";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
}));

jest.mock("@/db/db", () => {
  const { Sequelize } = require("sequelize");
  return new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
});

jest.mock("@/plugins/nodemailer", () => ({
  sendMail: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
}));

jest.mock("i18n", () => ({
  __: jest.fn().mockReturnValue("i18nTranslation"),
  configure: jest.fn(),
}));

describe("MailService", () => {
  beforeAll(async () => {
    process.env.IsTest = "true";
    process.env.BACKEND_DOMAIN = "Backend-Domain";
    process.env.FRONTEND_DOMAIN = "Frontend-Domain";
    process.env.SSO_TOKEN_EXPIRES_IN = "1h";
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    // Add any necessary cleanup for MailService tests here
  });
  test("instance has adminEmails", () => {
    expect(Array.isArray(MailService.adminEmails)).toBe(true);
    expect(MailService.adminEmails).toStrictEqual(["admin@example.com"]);
  });

  test("sendUserRegistrationNotice calls nodeMailer.sendMail", async () => {
    await expect(
      MailService.sendUserRegistrationNotice("user", "id", "email@example.com"),
    ).resolves.toBeDefined();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      "admin@example.com",
      "Neuer Nutzer",
      "newUser.ejs",
      { userEmail: "email@example.com", userId: "id", username: "user" },
      [
        {
          cid: "choreo-planer-icon",
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
        },
      ],
      "de",
    );
  });

  test("sendWelcomeEmail calls nodeMailer.sendMail", async () => {
    expect(() =>
      MailService.sendWelcomeEmail("user", "id", "email@example.com", "en"),
    ).not.toThrow();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      "email@example.com",
      "i18nTranslation",
      "welcome.ejs",
      { backendDomain: "Backend-Domain", userId: "id", username: "user" },
      [
        {
          cid: "choreo-planer-icon",
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
        },
      ],
      "en",
    );
  });

  test("sendEmailConfirmationEmail calls nodeMailer.sendMail", async () => {
    expect(() =>
      MailService.sendEmailConfirmationEmail(
        "user",
        "id",
        "email@example.com",
        "en",
      ),
    ).not.toThrow();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      "email@example.com",
      "i18nTranslation",
      "confirmEmail.ejs",
      {
        backendDomain: "Backend-Domain",
        userId: "id",
        username: "user",
        userEmail: "email@example.com",
      },
      [
        {
          cid: "choreo-planer-icon",
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
        },
      ],
      "en",
    );
  });

  test("sendFeedbackNotice calls nodeMailer.sendMail", async () => {
    expect(() =>
      MailService.sendFeedbackNotice(
        "user",
        "email@example.com",
        3,
        "test-text",
      ),
    ).not.toThrow();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      "admin@example.com",
      "Feedback ist eingegangen",
      "newFeedback.ejs",
      {
        username: "user",
        userEmail: "email@example.com",
        stars: 3,
        text: "test-text",
      },
      [
        {
          cid: "choreo-planer-icon",
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
        },
      ],
      "en",
    );
  });

  test("sendSsoEmail calls nodeMailer.sendMail", async () => {
    expect(() =>
      MailService.sendSsoEmail("email@example.com", "user", "sso-token", "en"),
    ).not.toThrow();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      "email@example.com",
      "i18nTranslation",
      "ssoLogin.ejs",
      {
        username: "user",
        ssoToken: "sso-token",
        frontendDomain: "Frontend-Domain",
        expirationDate: new Date(
          new Date().valueOf() + timeStringToMillis("1h"),
        ).toLocaleString("en", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
      },
      [
        {
          cid: "choreo-planer-icon",
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
        },
      ],
      "en",
    );
  });

  test("sendNotificationNotice calls nodeMailer.sendMail", async () => {
    expect(() =>
      MailService.sendNotificationNotice(
        "email@example.com",
        "user",
        "sso-token",
        "notification-title",
        "en",
      ),
    ).not.toThrow();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      "email@example.com",
      "i18nTranslation",
      "newNotification.ejs",
      {
        username: "user",
        ssoToken: "sso-token",
        notificationTitle: "notification-title",
        frontendDomain: "Frontend-Domain",
        expirationDate: new Date(
          new Date().valueOf() + timeStringToMillis("1h"),
        ).toLocaleString("en", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
      },
      [
        {
          cid: "choreo-planer-icon",
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
        },
      ],
      "en",
    );
  });
});
