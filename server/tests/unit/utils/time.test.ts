import { timeStringToMillis } from "@/utils/time";
import { describe, expect, jest, test } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
}));

describe("time", () => {
  test("timeStringToMilliseconds converts time strings to milliseconds", () => {
    expect(timeStringToMillis("1s")).toBe(1000);
    expect(timeStringToMillis("1m")).toBe(60000);
    expect(timeStringToMillis("1h")).toBe(3600000);
    expect(timeStringToMillis("1d")).toBe(86400000);
  });
});
