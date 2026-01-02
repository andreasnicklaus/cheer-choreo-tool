import toTimeAgo from "@/utils/time";
import { test, expect } from "@jest/globals";
import { describe } from "node:test";

describe("toTimeAgo", () => {
  test("should return 'just now' for current date", () => {
    const d = toTimeAgo(new Date(Date.now()));
    expect(d).toBe("just now");
  });

  test("should return '2 minutes ago' for now - 2 minutes", () => {
    const d = toTimeAgo(new Date(Date.now() - 120 * 1000));
    expect(d).toBe("2 minutes ago");
  });

  test("should return '100 years ago' for now - 100 years", () => {
    const d = toTimeAgo(new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000));
    expect(d).toBe("100 years ago");
  });

  test("should return 'null' for null", () => {
    const d = toTimeAgo(null);
    expect(d).toBe(null);
  });

  test("should return 'just now' for number input of current time", () => {
    const d = toTimeAgo(Date.now());
    expect(d).toBe("just now");
  });
});
