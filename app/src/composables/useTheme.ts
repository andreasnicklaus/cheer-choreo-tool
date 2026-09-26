import { ref, computed, watch, type Ref, type ComputedRef } from "vue";

const STORAGE_KEY = "theme-preference";

function getStoredTheme(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredTheme(theme: string): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

function getPreferredTheme(): string {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme: string): void {
  document.documentElement.setAttribute("data-bs-theme", theme);
}

interface ThemeInstance {
  theme: Ref<string>;
  isDark: ComputedRef<boolean>;
  toggleTheme: () => void;
}

let instance: ThemeInstance | null = null;

/**
 * Singleton composable for managing light/dark color theme.
 *
 * Follows Bootstrap 5.3's official color mode toggler pattern:
 * https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
 *
 * The inline <script> in index.html sets data-bs-theme before render
 * (no flash). This composable takes over after mount for reactivity.
 */
export function useTheme(): ThemeInstance {
  if (!instance) {
    const theme: Ref<string> = ref(getPreferredTheme());

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

    const isDark: ComputedRef<boolean> = computed(() => theme.value === "dark");

    function toggleTheme(): void {
      theme.value = isDark.value ? "light" : "dark";
    }

    instance = { theme, isDark, toggleTheme };
  }
  return instance;
}
