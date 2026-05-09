import { describe, expect, beforeAll, afterEach } from "@jest/globals";
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

jest.mock("@/services/MailService", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(null),
  sendEmailConfirmationEmail: jest.fn().mockResolvedValue(null),
  sendUserRegistrationNotice: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/services/NotificationService", () => ({
  createOne: jest.fn(),
  findOrCreate: jest.fn().mockResolvedValue({ id: "notification.id" }),
  markRead: jest.fn(),
}));

jest.mock("i18n", () => ({
  __: jest.fn().mockReturnValue("i18nTranslation"),
  configure: jest.fn(),
}));

describe("UserService", () => {
  beforeAll(async () => {
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
    const [user, ..._] = await UserService.findOrCreate(
      "test-username",
      "test-password",
    );
    expect(user).toBeDefined();
    expect(user).not.toBeNull();
    expect(user?.id).toStrictEqual(expect.any(String));

    const [foundUser, _created] = await UserService.findOrCreate(
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

  describe("getAll with deleted users", () => {
    test("getAll excludes deleted users by default", async () => {
      await User.create({ username: "active1", password: "password" });
      await User.create({ username: "active2", password: "password" });
      const deleted = await User.create({
        username: "deleted1",
        password: "password",
      });
      await deleted.destroy();

      const result = await UserService.getAll();
      expect(result.length).toBe(2);
    });

    test("getAll includes deleted users when includeDeleted is true", async () => {
      await User.create({ username: "active1", password: "password" });
      await User.create({ username: "active2", password: "password" });
      const deleted = await User.create({
        username: "deleted1",
        password: "password",
      });
      await deleted.destroy();

      const result = await UserService.getAll({ includeDeleted: true });
      expect(result.length).toBe(3);
    });

    test("findByUsernameOrEmail does not return deleted users", async () => {
      await User.create({ username: "activeUser", password: "password" });
      const deleted = await User.create({
        username: "deletedUser",
        password: "password",
      });
      await deleted.destroy();

      const result = await UserService.findByUsernameOrEmail("deletedUser");
      expect(result).toBeNull();
    });

    test("findByUsernameOrEmail returns active users", async () => {
      await User.create({ username: "activeUser", password: "password" });

      const result = await UserService.findByUsernameOrEmail("activeUser");
      expect(result).not.toBeNull();
      expect(result?.username).toBe("activeUser");
    });
  });

  describe("findDeletedByUsernameOrEmail", () => {
    test("returns deleted user by username", async () => {
      const deleted = await User.create({
        username: "deletedUser",
        password: "password",
      });
      await deleted.destroy();

      const result =
        await UserService.findDeletedByUsernameOrEmail("deletedUser");
      expect(result).not.toBeNull();
      expect(result?.username).toBe("deletedUser");
    });

    test("returns deleted user by email", async () => {
      const deleted = await User.create({
        username: "deletedUser",
        email: "deleted@example.com",
        password: "password",
      });
      await deleted.destroy();

      const result = await UserService.findDeletedByUsernameOrEmail(
        "deleted@example.com",
      );
      expect(result).not.toBeNull();
      expect(result?.email).toBe("deleted@example.com");
    });

    test("returns null for active users", async () => {
      await User.create({ username: "activeUser", password: "password" });

      const result =
        await UserService.findDeletedByUsernameOrEmail("activeUser");
      expect(result).toBeNull();
    });

    test("returns null for non-existent users", async () => {
      const result =
        await UserService.findDeletedByUsernameOrEmail("nonExistent");
      expect(result).toBeNull();
    });

    test("returns deleted user when given array of identifiers", async () => {
      const deleted = await User.create({
        username: "deletedUser",
        email: "deleted@example.com",
        password: "password",
      });
      await deleted.destroy();

      const result = await UserService.findDeletedByUsernameOrEmail([
        "otherUser",
        "deleted@example.com",
        "anotherUser",
      ]);
      expect(result).not.toBeNull();
      expect(result?.email).toBe("deleted@example.com");
    });
  });
});
