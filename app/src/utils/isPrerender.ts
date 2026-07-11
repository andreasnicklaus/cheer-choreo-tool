/**
 * Prerender detection utility
 * @module Util:IsPrerender
 */

export function isPrerender(): boolean {
  try {
    if (
      typeof window !== "undefined" &&
      (window as unknown as Record<string, unknown>).__PRERENDER__ === true
    ) {
      return true;
    }
  } catch (e) {
    // ignore
  }
  try {
    if (typeof document !== "undefined") {
      if (document.documentElement.getAttribute("data-prerender") === "true") {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
}
