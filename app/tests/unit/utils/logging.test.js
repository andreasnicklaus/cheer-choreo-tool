import VersionService from "@/services/VersionService";
import { debug, error, log, logWelcomeMessage, warn } from "@/utils/logging";
import {
  test,
  expect,
  describe,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import { Logtail } from "@logtail/browser";

vi.mock("@logtail/browser");

describe("logging", () => {
  let consoleDebug;
  let consoleLog;
  let consoleWarn;
  let consoleError;
  let consoleImage;
  let versionServiceSpy;

  beforeAll(() => {});

  beforeEach(() => {
    consoleDebug = vi.spyOn(console, "debug").mockImplementation(() => {});
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleImage = vi.spyOn(console, "image").mockImplementation(() => {});
    versionServiceSpy = vi
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
    versionServiceSpy.mockReset();
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
