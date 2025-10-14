import { describe, test, expect } from "@jest/globals";
import { Request, Response } from "express";
import { Sequelize } from "sequelize";
const _i18n = require("@/plugins/i18n");

process.env.TOKEN_SECRET = "testsecret";
process.env.JWT_EXPIRES_IN = "1h";

import Admin from "@/db/models/admin";
import User from "@/db/models/user";
import AuthService from "@/services/AuthService";
import MailService from "@/services/MailService";
import NotificationService from "@/services/NotificationService";

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

jest.mock("@/services/MailService", () => ({
  sendSsoEmail: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/services/NotificationService", () => ({
  createOne: jest.fn(),
  findOrCreate: jest.fn().mockResolvedValue({ id: "notification.id" }),
  markRead: jest.fn(),
}));

describe("AuthService", () => {
  beforeAll(async () => {
    process.env.isTest = "true";
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    const users = await User.findAll();
    const admins = await Admin.findAll();
    await Promise.all([
      ...users.map((user: User) => user.destroy({ force: true })),
      ...admins.map((admin: Admin) => admin.destroy({ force: true })),
    ]);
  });

  test("generateAccessToken should return a token", () => {
    const token = AuthService.generateAccessToken("test-user-id");
    expect(token).toBeDefined();
    expect(token).not.toBe("");
  });

  test("authenticateUser should return a function that passes authenticated requests", async () => {
    const user = await User.create({
      username: "test-user",
      password: "test-password",
    });
    const authToken = AuthService.generateAccessToken(user.id);

    const middleWareFunction = AuthService.authenticateUser();
    const nextMock = jest.fn();
    const statusMock = jest.fn();
    middleWareFunction(
      { headers: { authorization: `Bearer ${authToken}` } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(nextMock).toHaveBeenCalled();
  });

  test("authenticateUser should return a function that sends 401 if authentication is missing", () => {
    const middleWareFunction = AuthService.authenticateUser();
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn,
    }));
    middleWareFunction(
      { headers: { authorization: "Bearer" } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  test("authenticateUser should return a function that passes if authentication is missing and failIfNotLoggedIn is false", () => {
    const middleWareFunction = AuthService.authenticateUser(false);
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn,
    }));
    middleWareFunction(
      { headers: { authorization: "Bearer" } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalled();
  });

  test("authenticateUser should return a function that sends 403 on a invalid jwt token", () => {
    const middleWareFunction = AuthService.authenticateUser();
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn,
    }));
    middleWareFunction(
      { headers: { authorization: "Bearer asdfjkalsfjdlk" } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(403);
  });

  test("authenticateUser should return a function that passes on a invalid jwt token if failIfNotLoggedIn is false", () => {
    const middleWareFunction = AuthService.authenticateUser(false);
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn,
    }));
    middleWareFunction(
      { headers: { authorization: "Bearer asdfjkalsfjdlk" } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalled();
  });

  test("authenticateUser should return a function that sends 403 on a invalid user", async () => {
    const authToken = AuthService.generateAccessToken(
      "46ac9a72-c184-4c23-ae77-5650ed5c959c",
    );
    const middleWareFunction = AuthService.authenticateUser();
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn,
    }));
    middleWareFunction(
      { headers: { authorization: `Bearer ${authToken}` } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(statusMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(403);
  });

  test("authenticateUser should return a function that passes on a invalid user if failIfNotLoggedIn is false", async () => {
    const authToken = AuthService.generateAccessToken(
      "46ac9a72-c184-4c23-ae77-5650ed5c959c",
    );
    const middleWareFunction = AuthService.authenticateUser(false);
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn,
    }));
    middleWareFunction(
      { headers: { authorization: `Bearer ${authToken}` } } as Request,
      { status: statusMock } as unknown as Response,
      nextMock,
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(nextMock).toHaveBeenCalled();
  });

  test("resolveSsoToken should resolve on a valid sso token", async () => {
    const user = await User.create({
      username: "test-username",
      password: "test-password",
    });
    const ssoToken = await AuthService.generateAccessToken(user.id);
    const resolvedUser = (await AuthService.resolveSsoToken(ssoToken)) as User;
    expect(resolvedUser?.id).toBe(user.id);
  });

  test("resolveSsoToken should reject on a invalid sso token", async () => {
    const ssoToken = "asdfklasfjkfldsajfkljalksdfj";
    expect(AuthService.resolveSsoToken(ssoToken)).rejects.toThrow();
  });

  test("resolveSsoToken should reject on a non-existing user", async () => {
    const ssoToken = await AuthService.generateAccessToken(
      "102f3f1c-fd81-46ee-bf67-2c52fc441ef2",
    );
    expect(AuthService.resolveSsoToken(ssoToken)).rejects.toThrow();
  });

  test("generateSsoToken should send email and create notification", async () => {
    const username = "test-username";
    const password = "test-password";
    const email = "test@choreo-planer.de";
    const user = await User.create({ username, password, email });
    await AuthService.generateSsoToken(user.email as string);
    expect(MailService.sendSsoEmail).toHaveBeenCalled();
    expect(NotificationService.createOne).toHaveBeenCalled();
  });

  test("generateSsoToken should throw error for non-existant user", async () => {
    const email = "test@choreo-planer.de";
    expect(AuthService.generateSsoToken(email as string)).rejects.toThrow();
  });

  test("generateSsoToken should throw error for user without email address", async () => {
    const username = "test-username";
    const password = "test-password";
    await User.create({ username, password });
    expect(AuthService.generateSsoToken(username)).rejects.toThrow();
  });

  test("authenticateAdmin should return a function that passes with a valid authorization", async () => {
    await Admin.create({
      username: "test-user",
      password: "test-password",
    });

    const base64Auth = "dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=";

    const middleWareFunction = AuthService.authenticateAdmin();
    const nextMock = jest.fn();
    const statusMock = jest.fn(() => ({
      send: jest.fn(),
    }));
    const setMock = jest.fn();

    middleWareFunction(
      { headers: { authorization: `Basic ${base64Auth}` } } as Request,
      { status: statusMock, set: setMock } as unknown as Response,
      nextMock,
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(nextMock).toHaveBeenCalled();
  });

  test("authenticateAdmin should return a function that rejects with a invalid authorization", async () => {
    await Admin.create({
      username: "test-user",
      password: "test-password",
    });

    const base64Auth = "dGVzdC11c2VyOnRlc3QtcGFzc3dvcdQ=";

    const middleWareFunction = AuthService.authenticateAdmin();
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn(),
    }));
    const setMock = jest.fn();

    middleWareFunction(
      { headers: { authorization: `Basic ${base64Auth}` } } as Request,
      { status: statusMock, set: setMock } as unknown as Response,
      nextMock,
    );

    expect(nextMock).not.toHaveBeenCalled();
  });

  test("authenticateAdmin should return a function that rejects with a non-existent admin", async () => {
    const base64Auth = "dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=";

    const middleWareFunction = AuthService.authenticateAdmin();
    const nextMock = jest.fn();
    const statusMock = jest.fn((_status: number) => ({
      send: jest.fn(),
    }));
    const setMock = jest.fn();

    middleWareFunction(
      { headers: { authorization: `Basic ${base64Auth}` } } as Request,
      { status: statusMock, set: setMock } as unknown as Response,
      nextMock,
    );

    expect(nextMock).not.toHaveBeenCalled();
  });

  test("resolveAdmin should set AdminId and Admin of the request", async () => {
    const admin = await Admin.create({
      username: "test-user",
      password: "test-password",
    });

    const base64Auth = "dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=";

    const requestObject = {
      headers: { authorization: `Basic ${base64Auth}` },
    } as Request;
    const nextMock = jest.fn();

    await AuthService.resolveAdmin(
      requestObject,
      {} as unknown as Response,
      nextMock,
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(nextMock).toHaveBeenCalled();
    expect(requestObject.AdminId).toBe(admin.id);
    expect(requestObject.Admin.id).toBe(admin.id);
    expect(requestObject.Admin.username).toBe(admin.username);
  });

  test("resolveAdmin should throw an error for an missing authorization token", async () => {
    const requestObject = {
      headers: { authorization: `Basic` },
    } as Request;
    const nextMock = jest.fn();

    await AuthService.resolveAdmin(
      requestObject,
      {} as unknown as Response,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
  });

  test("resolveAdmin should skip resolving for an invalid authorization token", async () => {
    const base64Auth = "dGVzdC11c2VyOnRlc3QtcGFzc3dv";

    const requestObject = {
      headers: { authorization: `Basic ${base64Auth}` },
    } as Request;
    const nextMock = jest.fn();

    await AuthService.resolveAdmin(
      requestObject,
      {} as unknown as Response,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith();
    expect(requestObject.AdminId).toBeUndefined();
    expect(requestObject.Admin).toBeUndefined();
  });

  test("resolveAdmin should skip resolving for a non-existent admin", async () => {
    const base64Auth = "dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=";

    const requestObject = {
      headers: { authorization: `Basic ${base64Auth}` },
    } as Request;
    const nextMock = jest.fn();

    await AuthService.resolveAdmin(
      requestObject,
      {} as unknown as Response,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith();
    expect(requestObject.AdminId).toBeUndefined();
    expect(requestObject.Admin).toBeUndefined();
  });
});
