import { describe, test, expect } from "@jest/globals";
import { getUserFromRequest, formatError } from "@/mcp/helpers";

describe("getUserFromRequest", () => {
  test("returns user info from valid authInfo", () => {
    const authInfo = {
      token: "test-token",
      clientId: "mcp-client",
      scopes: [],
      extra: {
        userId: "user-123",
        ownerIds: ["owner-1", "owner-2"],
        isAdmin: false,
      },
    };
    const result = getUserFromRequest(authInfo);
    expect(result.userId).toBe("user-123");
    expect(result.ownerIds).toEqual(["owner-1", "owner-2"]);
    expect(result.isAdmin).toBe(false);
  });

  test("throws when authInfo is undefined", () => {
    expect(() => getUserFromRequest(undefined)).toThrow("Not authenticated");
  });

  test("throws when authInfo.extra is undefined", () => {
    const authInfo = {
      token: "test-token",
      clientId: "mcp-client",
      scopes: [],
    };
    expect(() => getUserFromRequest(authInfo)).toThrow("Not authenticated");
  });
});

describe("formatError", () => {
  test("formats Error with message", () => {
    const result = formatError(new Error("Something failed"));
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("Something failed");
  });

  test("formats unknown error with fallback message", () => {
    const result = formatError("string error");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Unknown error occurred");
  });

  test("formats null error with fallback message", () => {
    const result = formatError(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Unknown error occurred");
  });
});
