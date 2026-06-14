import { describe, jest, test, beforeEach, afterEach } from "@jest/globals";

const logMock = jest.fn();

jest.mock("@logtail/node", () => ({
  __esModule: true,
  Logtail: jest.fn().mockImplementation(() => ({
    log: logMock,
  })),
}));

describe("Winston Logger Plugin", () => {
  beforeEach(() => {
    process.env.BETTERSTACK_LOG_SOURCE_TOKEN = "test-token";
    process.env.BETTERSTACK_LOG_INGESTING_HOST = "logs.betterstack.com";
  });

  afterEach(() => {
    delete process.env.BETTERSTACK_LOG_SOURCE_TOKEN;
    delete process.env.BETTERSTACK_LOG_INGESTING_HOST;
  });

  test("logger logs log messages correctly", () => {
    jest.isolateModules(() => {
      const { default: logger } = require("@/plugins/winston");
      logger.info("Info message");

      expect(logMock).toHaveBeenCalledTimes(1);
      expect(logMock).toHaveBeenCalledWith(
        "Info message",
        "info",
        expect.objectContaining({
          timestamp: expect.any(String),
          [Symbol.for("level")]: expect.stringMatching("info"),
          [Symbol.for("message")]:
            expect.stringContaining("info: Info message"),
        }),
        {
          fileName: "node_modules/winston",
          methodNames: [
            "log",
            "error",
            "warn",
            "info",
            "http",
            "verbose",
            "debug",
            "silly",
          ],
        },
      );
    });
  });

  test("logger logs debug messages correctly", () => {
    jest.isolateModules(() => {
      const { default: logger } = require("@/plugins/winston");
      logger.debug("Debug message");

      expect(logMock).toHaveBeenCalledTimes(1);
      expect(logMock).toHaveBeenCalledWith(
        "Debug message",
        "debug",
        expect.objectContaining({
          timestamp: expect.any(String),
          [Symbol.for("level")]: expect.stringMatching("debug"),
          [Symbol.for("message")]: expect.stringContaining(
            "debug: Debug message",
          ),
        }),
        {
          fileName: "node_modules/winston",
          methodNames: [
            "log",
            "error",
            "warn",
            "info",
            "http",
            "verbose",
            "debug",
            "silly",
          ],
        },
      );
    });
  });
});
