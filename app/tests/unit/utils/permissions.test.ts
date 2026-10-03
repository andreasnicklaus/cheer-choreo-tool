import { describe, test, expect } from "vitest";
import { canWrite, canDelete, canRead } from "@/utils/permissions";

describe("permissions", () => {
  const meId = "user-1";

  describe("canWrite", () => {
    test("should return true for resource owner", () => {
      expect(canWrite([], meId, meId)).toBe(true);
    });

    test("should return true for coach", () => {
      const owners = [{ ownerUserId: "owner-1", role: "coach" }];
      expect(canWrite(owners, meId, "owner-1")).toBe(true);
    });

    test("should return true for assistant", () => {
      const owners = [{ ownerUserId: "owner-1", role: "assistant" }];
      expect(canWrite(owners, meId, "owner-1")).toBe(true);
    });

    test("should return false for member role", () => {
      const owners = [{ ownerUserId: "owner-1", role: "member" }];
      expect(canWrite(owners, meId, "owner-1")).toBe(false);
    });

    test("should return false if owner not found", () => {
      expect(canWrite([], meId, "owner-1")).toBe(false);
    });

    test("should return false for empty owners list", () => {
      expect(canWrite([], meId, "owner-1")).toBe(false);
    });
  });

  describe("canDelete", () => {
    test("should return true for resource owner", () => {
      expect(canDelete([], meId, meId)).toBe(true);
    });

    test("should return true for coach", () => {
      const owners = [{ ownerUserId: "owner-1", role: "coach" }];
      expect(canDelete(owners, meId, "owner-1")).toBe(true);
    });

    test("should return false for assistant", () => {
      const owners = [{ ownerUserId: "owner-1", role: "assistant" }];
      expect(canDelete(owners, meId, "owner-1")).toBe(false);
    });

    test("should return false for member role", () => {
      const owners = [{ ownerUserId: "owner-1", role: "member" }];
      expect(canDelete(owners, meId, "owner-1")).toBe(false);
    });

    test("should return false if owner not found", () => {
      expect(canDelete([], meId, "owner-1")).toBe(false);
    });
  });

  describe("canRead", () => {
    test("should return true for resource owner", () => {
      expect(canRead([], meId, meId)).toBe(true);
    });

    test("should return true if owner is enabled", () => {
      const owners = [{ ownerUserId: "owner-1", enabled: true }];
      expect(canRead(owners, meId, "owner-1")).toBe(true);
    });

    test("should return false if owner is disabled", () => {
      const owners = [{ ownerUserId: "owner-1", enabled: false }];
      expect(canRead(owners, meId, "owner-1")).toBe(false);
    });

    test("should return true if at least one owner entry is enabled", () => {
      const owners = [
        { ownerUserId: "owner-1", enabled: false },
        { ownerUserId: "owner-1", enabled: true },
      ];
      expect(canRead(owners, meId, "owner-1")).toBe(true);
    });

    test("should return false if owner not found", () => {
      expect(canRead([], meId, "owner-1")).toBe(false);
    });
  });
});
