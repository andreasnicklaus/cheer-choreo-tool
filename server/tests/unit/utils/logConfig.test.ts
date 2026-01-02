import logger from "@/plugins/winston";
import logConfig from "@/utils/logConfig";
import { describe, expect, test } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
  info: jest.fn(),
}));

describe("logConfig with environment", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("logConfig logs the configuration variables", async () => {
    process.env.POSTGRES_DB = "test";
    process.env.POSTGRES_USER = "test";
    process.env.DB_HOST = "test";
    process.env.POSTGRES_PASSWORD = "test";
    process.env.TOKEN_SECRET = "test";
    process.env.JWT_EXPIRES_IN = "test";
    process.env.SSO_TOKEN_EXPIRES_IN = "test";
    process.env.FRONTEND_DOMAIN = "test";
    process.env.DEFAULT_ADMIN_USERNAME = "test";
    process.env.DEFAULT_ADMIN_PASSWORD = "test";
    process.env.SMTP_SERVER = "test";
    process.env.SMTP_USER = "test";
    process.env.SMTP_PORT = "test";
    process.env.SMTP_PASSWORD = "test";
    process.env.EMAIL_ADMIN_ADDRESSES = "test";
    process.env.BACKEND_DOMAIN = "test";
    process.env.BETTERSTACK_LOG_INGESTING_HOST = "test";
    process.env.BETTERSTACK_LOG_SOURCE_TOKEN = "test";
    logConfig();

    expect(logger.info).toHaveBeenCalledTimes(30);
    expect(logger.debug).toHaveBeenCalledTimes(1);
  });
});
describe("logConfi w/o environment", () => {
  test("logConfig logs the configuration variables", async () => {
    logConfig();

    expect(logger.info).toHaveBeenCalledTimes(30);
    expect(logger.debug).toHaveBeenCalledTimes(1);
  });
});
