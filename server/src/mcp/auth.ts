import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types";

export type { AuthInfo };
import type { OAuthTokenVerifier } from "@modelcontextprotocol/sdk/server/auth/provider";
import User from "@/db/models/user";
import UserAccessService from "@/services/UserAccessService";
import FeatureFlagService, {
  FeatureFlagKey,
} from "@/services/FeatureFlagService";

const jwt = require("jsonwebtoken");

const TOKEN_SECRET = process.env.TOKEN_SECRET;

type jwtContent = { UserId: string; exp: number };

/**
 * OAuthTokenVerifier implementation that validates JWT access tokens.
 *
 * Verifies the token signature, looks up the user, resolves owner IDs,
 * and returns AuthInfo for the MCP request handler.
 */
export class JwtTokenVerifier implements OAuthTokenVerifier {
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const decoded = await new Promise<jwtContent>((resolve, reject) => {
      jwt.verify(token, TOKEN_SECRET, (err: Error, content: jwtContent) => {
        if (err) return reject(err);
        resolve(content);
      });
    });

    const user = await User.findByPk(decoded.UserId);
    if (!user) {
      throw new Error("User not found");
    }

    const accessSharingEnabled = await FeatureFlagService.isEnabled(
      FeatureFlagKey.ACCESS_SHARING,
    );

    let ownerIds: string[];
    if (accessSharingEnabled) {
      const ownerAccess = await UserAccessService.getOwners(user.id);
      if (ownerAccess.length > 0) {
        ownerIds = ownerAccess.map((oa) => oa.ownerUserId);
      } else {
        ownerIds = [user.id];
      }
    } else {
      ownerIds = [user.id];
    }

    return {
      token,
      clientId: "mcp-client",
      scopes: [],
      expiresAt: decoded.exp,
      extra: {
        userId: user.id,
        ownerIds,
        isAdmin: false,
      },
    };
  }
}
