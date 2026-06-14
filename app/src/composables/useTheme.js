import { ref, computed, watch } from "vue";

const STORAGE_KEY = "theme-preference";

function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
}

let instance = null;

/**
 * Singleton composable for managing light/dark color theme.
 *
 * Follows Bootstrap 5.3's official color mode toggler pattern:
 * https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
 *
 * The inline <script> in index.html sets data-bs-theme before render
 * (no flash). This composable takes over after mount for reactivity.
 */
export function useTheme() {
  if (!instance) {
    const theme = ref(getPreferredTheme());

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onOsChange = () => {
      if (!getStoredTheme()) {
        theme.value = getPreferredTheme();
      }
    };
    mediaQuery.addEventListener("change", onOsChange);

    watch(
      theme,
      (val) => {
        setTheme(val);
        setStoredTheme(val);
      },
      { immediate: true }
    );

    const isDark = computed(() => theme.value === "dark");

    function toggleTheme() {
      theme.value = isDark.value ? "light" : "dark";
    }

    instance = { theme, isDark, toggleTheme };
  }
  return instance;
}
