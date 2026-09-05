import { describe, test, expect, beforeEach, vi } from "vitest";
import LanguageService from "@/services/LanguageService";
import router from "@/router";

vi.mock("@/router");

describe("LanguageService", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "";
    vi.clearAllMocks();
  });

  describe("setLanguage", () => {
    test("should set language and update localStorage", () => {
      LanguageService.setLanguage("es", {
        storeInLocalStorage: true,
        routeAfterChange: false,
      });
      expect(document.documentElement.lang).toBe("es");
      expect(localStorage.getItem("cp-locale")).toBe("es");
    });

    test("should not store in localStorage if option is false", () => {
      LanguageService.setLanguage("fr", {
        storeInLocalStorage: false,
        routeAfterChange: false,
      });
      expect(document.documentElement.lang).toBe("fr");
      expect(localStorage.getItem("cp-locale")).toBeNull();
    });
    test("should initialize routing on change", () => {
      const mockReplace = router.replace.mockImplementation(() => {
        return Promise.resolve();
      });
      LanguageService.setLanguage("fr", {
        storeInLocalStorage: false,
        routeAfterChange: true,
      });
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
  });

  describe("loadLanguage", () => {
    test("should load language stored in localStorage", () => {
      localStorage.setItem("cp-locale", "es");
      const locale = LanguageService.loadLanguage(["en", "de", "es"]);
      expect(locale).toBe("es");
    });

    test("load language stored in window navigator", () => {
      Object.defineProperty(window.navigator, "language", {
        value: "es",
        configurable: true,
      });
      const locale = LanguageService.loadLanguage(["en", "de", "es"]);
      expect(locale).toBe("es");
    });
  });
});
