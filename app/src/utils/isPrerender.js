export function isPrerender() {
  try {
    if (typeof window !== "undefined" && window.__PRERENDER__ === true) {
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
