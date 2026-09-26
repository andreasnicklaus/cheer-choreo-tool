import { describe, test, expect } from "vitest";
import { emailRegex } from "@/utils/validation";

describe("validation", () => {
  describe("emailRegex", () => {
    test("should match valid email addresses", () => {
      expect("test@example.com").toMatch(emailRegex);
      expect("user.name@domain.co.uk").toMatch(emailRegex);
      expect("test_user123@sub.domain.org").toMatch(emailRegex);
    });

    test("should not match invalid email addresses", () => {
      expect("invalid-email").not.toMatch(emailRegex);
      expect("missing@domain").not.toMatch(emailRegex);
      expect("@missing-local.com").not.toMatch(emailRegex);
    });
  });
});
