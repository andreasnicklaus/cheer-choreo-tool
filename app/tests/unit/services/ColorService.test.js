import ColorService from "@/services/ColorService";
import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";

describe("ColorService", () => {
  describe("getRandom", () => {
    beforeEach(() => {
      vi.spyOn(global.Math, "random").mockReturnValue(0);
      beforeEach(() => {
        vi.spyOn(global.Math, "random").mockReturnValue(0);
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });
      const result = ColorService.getRandom();

      expect(result).toBe("#FF8888");
    });

    test("should return a random color not already used", () => {
      const result = ColorService.getRandom(["#FF8888"]);

      expect(result).toBe("#FF0000");
    });
  });
});
