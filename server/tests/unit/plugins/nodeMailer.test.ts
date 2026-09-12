import {
  sendMail,
  verify,
  isMailConfigured,
  isMailHealthy,
} from "@/plugins/nodemailer";
import { mailLogger } from "@/plugins/winston";
import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterAll,
} from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  mailLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn((cb: (err: Error | null, success: boolean) => void) =>
      cb(null, true),
    ),
    sendMail: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock("ejs", () => ({
  renderFile: jest.fn(
    (
      _path: string,
      _data: unknown,
      cb: (err: Error | null, html: string) => void,
    ) => {
      cb(null, "<html></html>");
    },
  ),
}));

jest.mock("i18n", () => ({
  __: jest.fn((str) => str),
}));

describe("Nodemailer Plugin  w/o environment", () => {
  test("verify logs warning instead of throwing", () => {
    expect(() => verify()).not.toThrow();
    expect(mailLogger.warn).toHaveBeenCalled();
  });

  test("isMailConfigured returns false when env vars are missing", () => {
    expect(isMailConfigured()).toBe(false);
  });

  test("isMailHealthy returns false when SMTP verify did not run", () => {
    expect(isMailHealthy()).toBe(false);
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

  test("isMailConfigured returns true when all env vars are set", () => {
    expect(isMailConfigured()).toBe(true);
  });

  test("isMailConfigured returns false when SMTP_SERVER is missing", () => {
    delete process.env.SMTP_SERVER;
    expect(isMailConfigured()).toBe(false);
  });

  test("isMailConfigured returns false when BACKEND_DOMAIN is missing", () => {
    delete process.env.BACKEND_DOMAIN;
    expect(isMailConfigured()).toBe(false);
  });

  test("isMailHealthy returns current cached SMTP verify state", () => {
    expect(typeof isMailHealthy()).toBe("boolean");
  });

  test("startup SMTP verify sets smtpVerified when env vars present", () => {
    jest.isolateModules(() => {
      process.env.SMTP_SERVER = "smtp.example.com";
      process.env.SMTP_PORT = "587";
      process.env.SMTP_USER = "user";
      const { isMailHealthy } = require("@/plugins/nodemailer");
      expect(isMailHealthy()).toBe(true);
    });
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
      [],
    );

    expect(mailLogger.info).toHaveBeenCalledTimes(1);
    expect(mailLogger.error).not.toHaveBeenCalled();
  });
});
