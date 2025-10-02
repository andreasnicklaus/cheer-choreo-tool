import { sendMail, verify } from "@/plugins/nodemailer";
import { mailLogger } from "@/plugins/winston";
import { describe } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  mailLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn(),
    sendMail: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock("i18n", () => ({
  __: jest.fn((str) => str),
}));

describe("Nodemailer Plugin  w/o environment", () => {
  test("verify throws error", () => {
    expect(() => verify()).toThrow();
  });
});

describe("Nodemailer Plugin  with environment", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.SMTP_SERVER = "test";
    process.env.SMTP_PORT = "test";
    process.env.SMTP_FROM_ADDRESS = "test";
    process.env.SMTP_USER = "test";
    process.env.SMTP_PASSWORD = "test";
    process.env.EMAIL_ADMIN_ADDRESSES = "test";
    process.env.BACKEND_DOMAIN = "test";
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("verify validates correctly with environment", () => {
    expect(() => verify()).not.toThrow();
  });

  test("sendMail sends mail correctly", async () => {
    await sendMail(
      "restRecipient",
      "testSubject",
      "welcome.ejs",
      {
        username: "testUser",
        userId: "testUserId",
        backendDomain: "testDomain",
      },
      []
    );

    expect(mailLogger.info).toHaveBeenCalledTimes(1);
    expect(mailLogger.error).not.toHaveBeenCalled();
  });
});
