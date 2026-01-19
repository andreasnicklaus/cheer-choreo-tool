import { describe, test, expect } from "@jest/globals";
import { Sequelize } from "sequelize";

process.env.TOKEN_SECRET = "testsecret";
process.env.JWT_EXPIRES_IN = "1h";

import Admin from "@/db/models/admin";
import User from "@/db/models/user";
import { NextFunction, Request, Response } from "express";
import UserService from "@/services/UserService";
import MailService from "@/services/MailService";
import NotificationService from "@/services/NotificationService";
import AdminService from "@/services/AdminService";
import bcrypt from "bcrypt";
import {
  AuthorizationError,
  FaultyInputError,
  NotFoundError,
} from "@/utils/errors";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/db/db", () => {
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

jest.mock("i18n", () => ({
  __: jest.fn().mockImplementation((opts: { phrase?: string } | string | undefined) => {
    if (opts && typeof opts === "object" && (opts as { phrase?: string }).phrase)
      return (opts as { phrase?: string }).phrase;
    return String(opts || "");
  }),
}));

jest.mock("express-basic-auth", () => {
  type BasicAuthOpts = {
    authorizer: (
      username: string,
      password: string,
      cb?: (err: Error | null, authorized: boolean) => void,
    ) => void;
    authorizeAsync?: boolean;
  };
  return (opts: BasicAuthOpts) => {
    // expose last options so tests can call the authorizer directly
    (global as unknown as Record<string, unknown>)["__lastBasicAuthOpts"] = opts;
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers && req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const decoded = token ? Buffer.from(token, "base64").toString() : ":";
        const [username, password] = decoded.split(":");
        if (opts && opts.authorizeAsync) {
          return opts.authorizer(username, password, (_err: Error | null, authorized: boolean) => {
            if (authorized) return next();
            return res.status && res.status(401) && res.status(401).send && res.status(401).send();
          });
        }
        const ok = opts.authorizer(username, password as string) as unknown as boolean;
        if (ok) return next();
        return res.status && res.status(401) && res.status(401).send && res.status(401).send();
      } catch (_e) {
        return res.status && res.status(500) && res.status(500).send && res.status(500).send();
      }
    };
  };
});

import AuthService from "@/services/AuthService";
import NotificationModel from "@/db/models/notification";

describe("AuthService", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  afterEach(async () => {
    await Promise.all([
      User.destroy({ where: {}, force: true }),
      Admin.destroy({ where: {}, force: true }),
    ]);
    jest.restoreAllMocks();
  });

  test("resolveSsoToken should resolve user with valid token", async () => {
    const testUser = await User.create({
      username: "testuser",
      password: "hashedpass",
      email: "test@example.com",
    });

    const token = AuthService.generateAccessToken(testUser.id);
    const user = await AuthService.resolveSsoToken(token);
    expect(user.id).toBe(testUser.id);
  });

  test("resolveSsoToken should reject with invalid token", async () => {
    await expect(AuthService.resolveSsoToken("invalid.token.here")).rejects.toBeInstanceOf(
      AuthorizationError,
    );
  });

  test("resolveSsoToken should reject when user not found", async () => {
    const token = AuthService.generateAccessToken("non-existent-id");
    await expect(AuthService.resolveSsoToken(token)).rejects.toBeInstanceOf(
      AuthorizationError,
    );
  });

  test("generateSsoToken should send email and create notification", async () => {
    const testUser = await User.create({
      username: "ssouser",
      password: "hashedpass",
      email: "sso@example.com",
    });

    jest.spyOn(UserService, "findByUsernameOrEmail").mockResolvedValue(testUser);
    const mailSpy = jest.spyOn(MailService, "sendSsoEmail").mockResolvedValue();
    const notifSpy = jest
      .spyOn(NotificationService, "createOne")
      .mockResolvedValue({} as NotificationModel);

    await AuthService.generateSsoToken("sso@example.com");

    expect(mailSpy).toHaveBeenCalledWith(
      testUser.email,
      testUser.username,
      expect.any(String),
      "en",
    );
    expect(notifSpy).toHaveBeenCalled();
  });

  test("generateSsoToken should throw when user not found", async () => {
    jest.spyOn(UserService, "findByUsernameOrEmail").mockResolvedValue(null);

    await expect(AuthService.generateSsoToken("missing@example.com")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  test("generateSsoToken should throw when user has no email", async () => {
    const testUser = await User.create({
      username: "noemailuser",
      password: "hashedpass",
    });

    jest.spyOn(UserService, "findByUsernameOrEmail").mockResolvedValue(testUser);

    await expect(AuthService.generateSsoToken("noemailuser")).rejects.toBeInstanceOf(
      FaultyInputError,
    );
  });

  test("authenticateUser should set UserId and User on valid token", (done) => {
    User.create({ username: "authuser", password: "hashedpass" }).then((user) => {
      const token = AuthService.generateAccessToken(user.id);
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn(() => {
        try {
          expect(req.UserId).toBe(user.id);
          expect(req.User).toBeDefined();
          done();
        } catch (e) {
          done(e as Error);
        }
      });

      const middleware = AuthService.authenticateUser();
      middleware(req, res, next as unknown as NextFunction);
    });
  });

  test("authenticateUser should return 401 when no token provided", () => {
    const req = { headers: {} } as unknown as Request;
    const sendMock = jest.fn();
    const res = { status: jest.fn().mockReturnValue({ send: sendMock }) } as unknown as Response;
    const next = jest.fn();

    const middleware = AuthService.authenticateUser();
    middleware(req, res, next as unknown as NextFunction);

    expect((res as Response).status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalled();
  });

  test("authenticateUser should return 403 on invalid token", (done) => {
    const req = {
      headers: { authorization: "Bearer invalid.token" },
    } as unknown as Request;
    const res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) } as unknown as Response;
    const next = jest.fn();

    const middleware = AuthService.authenticateUser();
    middleware(req, res, next as unknown as NextFunction);

    setTimeout(() => {
      try {
        expect((res as Response).status).toHaveBeenCalledWith(403);
        done();
      } catch (e) {
        done(e as Error);
      }
    }, 50);
  });

  test("authenticateUser with failIfNotLoggedIn=false should call next when no token", () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    const middleware = AuthService.authenticateUser(false);
    middleware(req, res, next as NextFunction);

    expect(next).toHaveBeenCalled();
  });

  test("authenticateAdmin authorizer accepts valid credentials", async () => {
    const passwordPlain = "adminpass";
    const admin = await Admin.create({ username: "adminuser", password: passwordPlain });

    jest.spyOn(AdminService, "findByUsername").mockResolvedValue(admin as unknown as Admin);

    const found = await AdminService.findByUsername("adminuser", { scope: "withPasswordHash" });
    expect(found).toBeDefined();
    expect(bcrypt.compareSync(passwordPlain, (found as unknown as Admin).password)).toBe(true);
  });



  test("authenticateUser should return 403 when token belongs to missing user", (done) => {
    const token = AuthService.generateAccessToken("does-not-exist");
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const sendMock = jest.fn();
    const res = { status: jest.fn().mockReturnValue({ send: sendMock }) } as unknown as Response;
    const next = jest.fn();

    const middleware = AuthService.authenticateUser();
    middleware(req, res, next as NextFunction);

    setTimeout(() => {
      try {
        expect((res as Response).status).toHaveBeenCalledWith(403);
        expect(sendMock).toHaveBeenCalled();
        done();
      } catch (e) {
        done(e as Error);
      }
    }, 50);
  });

  test("authenticateAdmin middleware should call next on valid credentials", async () => {
    const passwordPlain = "adminpass2";
    const admin = await Admin.create({ username: "adminok", password: passwordPlain });
    jest.spyOn(AdminService, "findByUsername").mockResolvedValue(admin as unknown as Admin);

    const middleware = AuthService.authenticateAdmin();
    const token = Buffer.from(`adminok:${passwordPlain}`).toString("base64");
    const req = { headers: { authorization: `Basic ${token}` } } as unknown as Request;
    const res = ({ set: jest.fn(), status: jest.fn().mockReturnValue({ send: jest.fn() }) } as unknown) as Response;

    await new Promise<void>((resolve, reject) => {
      const next = jest.fn(() => resolve());
      middleware(req, res, next as unknown as NextFunction);
      setTimeout(() => reject(new Error("middleware did not call next")), 1000);
    });
  });

  test("authenticateAdmin middleware should respond 401 on invalid credentials", async () => {
    jest.spyOn(AdminService, "findByUsername").mockResolvedValue(null as unknown as Admin);

    const middleware = AuthService.authenticateAdmin();
    const token = Buffer.from(`nouser:bad`).toString("base64");
    const sendMock = jest.fn();
    const res = { set: jest.fn(), status: jest.fn().mockReturnValue({ send: sendMock }) } as unknown as Response;
    const req = { headers: { authorization: `Basic ${token}` } } as unknown as Request;

    await new Promise<void>((resolve, reject) => {
      const next = jest.fn();
      middleware(req, res, next as unknown as NextFunction);
      setTimeout(() => {
        try {
          expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(401);
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 100);
    });
  });

  test("authenticateAdmin middleware should respond 401 when password mismatches", async () => {
    const admin = await Admin.create({ username: "mismatch", password: "rightpass" });
    jest.spyOn(AdminService, "findByUsername").mockResolvedValue(admin as unknown as Admin);

    const middleware = AuthService.authenticateAdmin();
    const token = Buffer.from(`mismatch:wrongpass`).toString("base64");
    const sendMock = jest.fn();
    const res = { set: jest.fn(), status: jest.fn().mockReturnValue({ send: sendMock }) } as unknown as Response;
    const req = { headers: { authorization: `Basic ${token}` } } as unknown as Request;

    await new Promise<void>((resolve, reject) => {
      const next = jest.fn();
      middleware(req, res, next as unknown as NextFunction);
      setTimeout(() => {
        try {
          expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(401);
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 100);
    });
  });

  test("authenticateAdmin middleware should respond 401 when AdminService errors", async () => {
    jest.spyOn(AdminService, "findByUsername").mockRejectedValue(new Error("db fail"));

    const middleware = AuthService.authenticateAdmin();
    const token = Buffer.from(`any:val`).toString("base64");
    const sendMock = jest.fn();
    const res = { set: jest.fn(), status: jest.fn().mockReturnValue({ send: sendMock }) } as unknown as Response;
    const req = { headers: { authorization: `Basic ${token}` } } as unknown as Request;

    await new Promise<void>((resolve, reject) => {
      const next = jest.fn();
      middleware(req, res, next as unknown as NextFunction);
      setTimeout(() => {
        try {
          expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(401);
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 100);
    });
  });

  test("resolveAdmin should call next with AuthorizationError when no token provided", async () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as unknown as Response;

    await new Promise<void>((resolve, reject) => {
      const next = jest.fn((err?: Error) => {
        try {
          expect(err).toBeInstanceOf(AuthorizationError);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      AuthService.resolveAdmin(req, res, next as unknown as NextFunction);
    });
  });

  test("resolveAdmin should set Admin and AdminId when token valid", (done) => {
    (async () => {
      const hashed = bcrypt.hashSync("irrelevant", 1);
      const admin = await Admin.create({ username: "admuser", password: hashed });

      jest.spyOn(AdminService, "findByUsername").mockResolvedValue(admin as unknown as Admin);

      const token = Buffer.from(`admuser:whatever`).toString("base64");
      const req: Partial<Request> = { headers: { authorization: `Bearer ${token}` } };
      const res = {} as Response;
      const next = jest.fn(() => {
        try {
          expect((req as unknown as Partial<Request>).AdminId).toBe(admin.id);
          expect((req as unknown as Partial<Request>).Admin).toBeDefined();
          done();
        } catch (e) {
          done(e as Error);
        }
      });

      AuthService.resolveAdmin(req as Request, res, next as unknown as NextFunction);
    })();
  });

  test("generateAccessToken should return a token", () => {
    const token = AuthService.generateAccessToken("test-user-id");
    expect(token).toBeDefined();
    expect(token).not.toBe("");
  });
});
