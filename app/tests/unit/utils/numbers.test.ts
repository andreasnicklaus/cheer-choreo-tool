import { describe, test, expect, vi, beforeEach } from "vitest";
import { roundToDecimals, clamp } from "@/utils/numbers";

describe("numbers", () => {
  describe("roundToDecimals", () => {
    test("rounds to specified decimals", () => {
      expect(roundToDecimals(1.234567, 2)).toBe(1.23);
      expect(roundToDecimals(1.235567, 2)).toBe(1.24);
      expect(roundToDecimals(1.234567, 0)).toBe(1);
    });
  });

  describe("clamp", () => {
    test("clamps number to range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test("clamps and rounds number to range", () => {
      expect(clamp(5.567, 0, 10, 2)).toBe(5.57);
      expect(clamp(-5.567, 0, 10, 2)).toBe(0);
      expect(clamp(15.567, 0, 10, 2)).toBe(10);
    });
  });
});
