import { describe, expect, jest } from "@jest/globals";

jest.mock("i18n", () => ({
  configure: jest.fn(),
}));

describe("i18n Plugin", () => {
  test("i18n is configured", () => {
    expect(() => require("@/plugins/i18n")).not.toThrow();
  });
});
