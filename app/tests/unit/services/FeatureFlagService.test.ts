import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("unleash-proxy-client", () => {
  return {
    UnleashClient: class {
      start = vi.fn().mockResolvedValue();
      isEnabled = vi.fn().mockReturnValue(true);
    },
  };
});

import FeatureFlagService, {
  FeatureFlagKeys,
} from "@/services/FeatureFlagService";

describe("LineupService", () => {
  describe("isEnabled", () => {
    test("should return true for enabled flags", async () => {
      const result = await FeatureFlagService.isEnabled(
        FeatureFlagKeys.MOBILE_EDITING
      );
      expect(result).toBe(true);
    });

    test("should log a warning for unknown flags", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      await FeatureFlagService.isEnabled("unknown-flag");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.any(String),
        "WARN",
        "Unknown feature flag: unknown-flag"
      );
      warnSpy.mockRestore();
    });
  });
});
