import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types";

interface UserInfo {
  userId: string;
  ownerIds: string[];
  isAdmin: boolean;
}

/**
 * Extract user info from MCP request handler extra.
 *
 * The AuthInfo.extra field carries userId, ownerIds, and isAdmin
 * set by the JwtTokenVerifier during authentication.
 */
export function getUserFromRequest(authInfo: AuthInfo | undefined): UserInfo {
  if (!authInfo?.extra) {
    throw new Error("Not authenticated");
  }
  return authInfo.extra as unknown as UserInfo;
}

/**
 * Format an error into an MCP tool result.
 *
 * Returns a consistent error response shape that the MCP SDK expects.
 */
export function formatError(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const message =
    error instanceof Error ? error.message : "Unknown error occurred";
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}
