import { afterEach, describe, expect, test } from "@jest/globals";
import {
  createEmailActionToken,
  verifyEmailActionToken,
} from "@/utils/emailActionToken";

const originalTokenSecret = process.env.TOKEN_SECRET;

afterEach(() => {
  if (originalTokenSecret === undefined) {
    delete process.env.TOKEN_SECRET;
  } else {
    process.env.TOKEN_SECRET = originalTokenSecret;
  }
});

describe("email action tokens", () => {
  test("creates and verifies a confirmation token", () => {
    process.env.TOKEN_SECRET = "test-token-secret";

    const token = createEmailActionToken("user-123", "confirm-email");

    expect(verifyEmailActionToken(token, "confirm-email")).toBe("user-123");
  });

  test("rejects a token used for a different action", () => {
    process.env.TOKEN_SECRET = "test-token-secret";
    const token = createEmailActionToken("user-123", "confirm-email");

    expect(() => verifyEmailActionToken(token, "revoke-email")).toThrow(
      "Invalid email action token",
    );
  });

  test("rejects an invalid token", () => {
    process.env.TOKEN_SECRET = "test-token-secret";

    expect(() =>
      verifyEmailActionToken("not-a-valid-token", "confirm-email"),
    ).toThrow();
  });

  test("requires TOKEN_SECRET to create a token", () => {
    delete process.env.TOKEN_SECRET;

    expect(() => createEmailActionToken("user-123", "confirm-email")).toThrow(
      "TOKEN_SECRET is not set",
    );
  });
});
