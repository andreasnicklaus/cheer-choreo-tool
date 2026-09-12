import { vi } from "vitest";

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => {
      return store[key] ?? null;
    }),

    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),

    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),

    clear: vi.fn(() => {
      store = {};
    }),
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: createLocalStorageMock(),
  writable: true,
});
