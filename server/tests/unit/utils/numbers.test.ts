import { describe, expect, jest, test } from "@jest/globals";
const roundToDecimals = require("@/utils/numbers");

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
}));

describe("numbers", () => {
  test("roundToDecimals rounds numbers to the correct amount of decimals", () => {
    expect(roundToDecimals(1.23456, 2)).toBe(1.23);
    expect(roundToDecimals(1.23556, 2)).toBe(1.24);
    expect(roundToDecimals(1.2, 2)).toBe(1.2);
    expect(roundToDecimals(1, 2)).toBe(1);
    expect(roundToDecimals(1.9999, 3)).toBe(2);
    expect(roundToDecimals(-1.23456, 2)).toBe(-1.23);
    expect(roundToDecimals(-1.23556, 2)).toBe(-1.24);
    expect(roundToDecimals(-1.2, 2)).toBe(-1.2);
    expect(roundToDecimals(-1, 2)).toBe(-1);
    expect(roundToDecimals(-1.9999, 3)).toBe(-2);
  });
});
