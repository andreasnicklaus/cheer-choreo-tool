import toTimeAgo from "@/utils/time";
import { test, expect } from "@jest/globals";
import { describe } from "node:test";

describe("toTimeAgo", () => {
  test("should return 'just now' for current date", () => {
    const d = toTimeAgo(new Date(Date.now()));
    expect(d).toBe("just now");
  });
});
