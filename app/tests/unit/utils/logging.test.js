import VersionService from "@/services/VersionService";
import { debug, error, log, logWelcomeMessage, warn } from "@/utils/logging";
import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
  beforeAll,
} from "@jest/globals";
import { Logtail } from "@logtail/browser";

jest.mock("@logtail/browser");

describe("logging", () => {
  let consoleDebug;
  let consoleLog;
  let consoleWarn;
  let consoleError;
  let consoleImage;

  beforeAll(() => {});

  beforeEach(() => {
    consoleDebug = jest.spyOn(console, "debug").mockImplementation(() => {});
    consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleImage = jest.spyOn(console, "image").mockImplementation(() => {});
    jest
      .spyOn(VersionService, "getServerVersion")
      .mockImplementation(() => "test");
    Logtail.mockClear();
  });
  afterEach(() => {
    consoleDebug.mockReset();
    consoleLog.mockReset();
    consoleWarn.mockReset();
    consoleError.mockReset();
    consoleImage.mockReset();
  });
  test("console.log is called thrice in welcome message", async () => {
    await logWelcomeMessage();
    expect(consoleLog).toHaveBeenCalledTimes(3);
  });
  test("console.image is called once in welcome message", async () => {
    await logWelcomeMessage();
    expect(consoleImage).toHaveBeenCalledTimes(1);
  });
  test("console.debug is called in debug function", async () => {
    debug();
    expect(consoleDebug).toHaveBeenCalledTimes(1);
  });
  test("console.log is called in log function", async () => {
    log();
    expect(consoleLog).toHaveBeenCalledTimes(1);
  });
  test("console.warn is called in warn function", async () => {
    warn();
    expect(consoleWarn).toHaveBeenCalledTimes(1);
  });
  test("console.error is called in warn function", async () => {
    error();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});
