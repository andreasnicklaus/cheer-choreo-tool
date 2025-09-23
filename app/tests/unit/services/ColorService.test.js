import ColorService from "@/services/ColorService";
import { test, expect, jest, beforeEach } from "@jest/globals";

import { afterEach, describe } from "node:test";

describe("ChoreoService", () => {
  describe("getRandom", () => {
    beforeEach(() => {
      jest.spyOn(global.Math, "random").mockReturnValue(0);
    });

    afterEach(() => {
      jest.spyOn(global.Math, "random").mockRestore();
    });

    test("should return a truly random color if no color is already used", () => {
      const result = ColorService.getRandom();

      expect(result).toBe("#FF8888");
    });

    test("should return a random color not already used", () => {
      const result = ColorService.getRandom(["#FF8888"]);

      expect(result).toBe("#FF0000");
    });
  });
});
