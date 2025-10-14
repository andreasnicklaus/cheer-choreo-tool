import { describe, test, expect } from "@jest/globals";
import UserService from "@/services/UserService";
import User from "@/db/models/user";
import MailService from "@/services/MailService";
import NotificationService from "@/services/NotificationService";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
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

jest.mock("@/services/MailService", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(null),
  sendEmailConfirmationEmail: jest.fn().mockResolvedValue(null),
  sendUserRegistrationNotice: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/services/NotificationService", () => ({
  createOne: jest.fn(),
  findOrCreate: jest.fn(),
}));

jest.mock("i18n", () => ({
  __: jest.fn().mockReturnValue("i18nTranslation"),
  configure: jest.fn(),
}));

describe("UserService", () => {
  beforeAll(async () => {
    process.env.IsTest = "true";
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  test("getAll returns all users", async () => {
    await User.create({ username: "username1", password: "password" });
    await User.create({ username: "username2", password: "password" });
    const result = await UserService.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test("findById returns user for valid id", async () => {
    const user = await User.create({
      username: "username1",
      password: "password",
    });
    const result = await UserService.findById(user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(user.id);
    }
  });

  test("findById returns null for invalid id", async () => {
    const result = await UserService.findById("invalid-id");
    expect(result).toBeNull();
  });

  test("findByUsernameOrEmail returns user for valid username", async () => {
    const _user = await User.create({
      username: "username1",
      email: "user1@example.com",
      password: "password",
    });
    const result = await UserService.findByUsernameOrEmail("username1");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.username).toBe("username1");
    }
  });

  test("findByUsernameOrEmail returns user for valid email", async () => {
    const _user = await User.create({
      username: "username2",
      email: "user2@example.com",
      password: "password",
    });
    const result = await UserService.findByUsernameOrEmail("user2@example.com");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.email).toBe("user2@example.com");
    }
  });

  test("findByUsernameOrEmail returns null for invalid username/email", async () => {
    const result = await UserService.findByUsernameOrEmail("invalid");
    expect(result).toBeNull();
  });

  test("getCount returns correct count", async () => {
    await User.create({ username: "username1", password: "password" });
    await User.create({ username: "username2", password: "password" });
    const result = await UserService.getCount();
    expect(result).toEqual(2);
  });

  test("getTrend returns correct count", async () => {
    await User.create({ username: "username1", password: "password" });
    await User.create({ username: "username2", password: "password" });
    const result = await UserService.getTrend();
    expect(result).toEqual(2);
  });

  test("create creates a user, sends notification and e-mail", async () => {
    const user = await UserService.create(
      "username1",
      "password",
      "user1@choreo-planer.de",
      false,
      "de",
    );
    expect(user).toBeDefined();
    expect(user).not.toBeNull();
    expect(user.id).toStrictEqual(expect.any(String));

    expect(MailService.sendUserRegistrationNotice).toHaveBeenCalled();
    expect(MailService.sendWelcomeEmail).toHaveBeenCalled();
    expect(MailService.sendEmailConfirmationEmail).toHaveBeenCalled();
    expect(NotificationService.createOne).toHaveBeenCalled();
  });

  test("findOrCreate creates or returns existing user", async () => {
    const user = await UserService.findOrCreate(
      "test-username",
      "test-password",
    );
    expect(user).toBeDefined();
    expect(user).not.toBeNull();
    expect(user?.id).toStrictEqual(expect.any(String));

    const foundUser = await UserService.findOrCreate(
      "test-username",
      "test-password",
    );
    expect(foundUser.id).toEqual(user.id);
  });

  test("update updates a user", async () => {
    const user = await User.create({
      username: "test-username",
      password: "test-password",
    });
    const updatedUser = await UserService.update(user.id, {
      username: "updated-name",
    });
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.id).toBe(user.id);
    expect(updatedUser?.username).toBe("updated-name");
  });

  test("update throws for invalid id", async () => {
    expect(
      UserService.update("invalid-id", { username: "updated-name" }),
    ).rejects.toThrow();
  });

  test("remove should delete user", async () => {
    const user = await User.create({
      username: "test-username",
      password: "test-password",
    });
    expect(await UserService.getCount()).toBe(1);
    await UserService.remove(user.id);
    expect(await UserService.getCount()).toBe(0);
  });

  test("remove on non-existing user should throw", async () => {
    expect(() => UserService.remove("non-existing-id")).rejects.toThrow();
  });

  test("getLoggedInPercentage returns correct percentage", async () => {
    await User.create({
      username: "test-username",
      password: "test-password",
    });
    await User.create({
      username: "test-username2",
      password: "test-password",
      lastLoggedIn: new Date(),
    });
    const result = await UserService.getLoggedInPercentage();
    expect(result).toEqual(50);
  });
});
