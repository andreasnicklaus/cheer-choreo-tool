import { describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
  info: jest.fn(),
}));

jest.mock("@/db/db", () => {
  const { Sequelize } = require("sequelize");
  return new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
});

jest.mock("@/plugins/nodemailer", () => ({
  sendMail: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const mockUser = {
  id: "user-123",
  username: "testuser",
};

jest.mock("@/db/models/user", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

jest.mock("@/services/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    isEnabled: jest.fn(),
  },
  FeatureFlagKey: {
    ACCESS_SHARING: "access-sharing",
  },
}));

jest.mock("@/services/UserAccessService", () => ({
  __esModule: true,
  default: {
    getOwners: jest.fn(),
  },
}));

import { JwtTokenVerifier } from "@/mcp/auth";
import User from "@/db/models/user";
import FeatureFlagService from "@/services/FeatureFlagService";
import UserAccessService from "@/services/UserAccessService";
const jwt = require("jsonwebtoken");

describe("JwtTokenVerifier", () => {
  const verifier = new JwtTokenVerifier();

  beforeEach(() => {
    process.env.TOKEN_SECRET = "test-secret";
    jest.clearAllMocks();
  });

  test("returns valid AuthInfo for valid token", async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (
        _token: string,
        _secret: string,
        cb: (err: Error | null, decoded: { UserId: string } | null) => void,
      ) => {
        cb(null, { UserId: "user-123" });
      },
    );
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (FeatureFlagService.isEnabled as jest.Mock).mockResolvedValue(false);

    const result = await verifier.verifyAccessToken("valid-token");

    expect(result.token).toBe("valid-token");
    expect(result.clientId).toBe("mcp-client");
    expect(result.extra).toEqual({
      userId: "user-123",
      ownerIds: ["user-123"],
      isAdmin: false,
    });
  });

  test("resolves ownerIds via UserAccessService when access sharing enabled", async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (
        _token: string,
        _secret: string,
        cb: (err: Error | null, decoded: { UserId: string } | null) => void,
      ) => {
        cb(null, { UserId: "user-123" });
      },
    );
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (FeatureFlagService.isEnabled as jest.Mock).mockResolvedValue(true);
    (UserAccessService.getOwners as jest.Mock).mockResolvedValue([
      { ownerUserId: "owner-1" },
      { ownerUserId: "owner-2" },
    ]);

    const result = await verifier.verifyAccessToken("valid-token");

    expect(result.extra).toEqual({
      userId: "user-123",
      ownerIds: ["owner-1", "owner-2"],
      isAdmin: false,
    });
  });

  test("falls back to [userId] when access sharing enabled but no owners", async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (
        _token: string,
        _secret: string,
        cb: (err: Error | null, decoded: { UserId: string } | null) => void,
      ) => {
        cb(null, { UserId: "user-123" });
      },
    );
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (FeatureFlagService.isEnabled as jest.Mock).mockResolvedValue(true);
    (UserAccessService.getOwners as jest.Mock).mockResolvedValue([]);

    const result = await verifier.verifyAccessToken("valid-token");

    expect(result.extra).toEqual({
      userId: "user-123",
      ownerIds: ["user-123"],
      isAdmin: false,
    });
  });

  test("throws on invalid token", async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (
        _token: string,
        _secret: string,
        cb: (err: Error | null, decoded: { UserId: string } | null) => void,
      ) => {
        cb(new Error("invalid token"), null);
      },
    );

    await expect(verifier.verifyAccessToken("bad-token")).rejects.toThrow(
      "invalid token",
    );
  });

  test("throws when user not found", async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (
        _token: string,
        _secret: string,
        cb: (err: Error | null, decoded: { UserId: string } | null) => void,
      ) => {
        cb(null, { UserId: "nonexistent-user" });
      },
    );
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    await expect(verifier.verifyAccessToken("valid-token")).rejects.toThrow(
      "User not found",
    );
  });
});
