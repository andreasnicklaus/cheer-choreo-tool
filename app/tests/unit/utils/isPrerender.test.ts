import { describe, test, expect, beforeEach, vi } from "vitest";
import { isPrerender } from "@/utils/isPrerender";

describe("isPrerender", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", {
      documentElement: {
        getAttribute: vi.fn().mockReturnValue(null),
      },
    });
  });

  test("should return false by default", () => {
    expect(isPrerender()).toBe(false);
  });

  test("should return true when window.__PRERENDER__ is true", () => {
    vi.stubGlobal("window", { __PRERENDER__: true });
    expect(isPrerender()).toBe(true);
  });

  test("should return true when document has data-prerender attribute", () => {
    vi.stubGlobal("document", {
      documentElement: {
        getAttribute: vi.fn().mockReturnValue("true"),
      },
    });
    expect(isPrerender()).toBe(true);
  });
});
