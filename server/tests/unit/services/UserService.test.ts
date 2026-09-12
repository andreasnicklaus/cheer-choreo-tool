import {
  describe,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import UserService from "@/services/UserService";
import User from "@/db/models/user";
import MailService from "@/services/MailService";
import NotificationService from "@/services/NotificationService";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
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

// Import AuthProvider after mocks are set up
import { AuthProvider } from "@/plugins/passport";

jest.mock("@/services/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    isEnabled: jest.fn().mockResolvedValue(true),
  },
  FeatureFlagKey: {
    ACCESS_SHARING: "access-sharing",
  },
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

  describe("generateSocialUsername", () => {
    test("sanitizes special characters from display name", () => {
      const result = UserService.generateSocialUsername(
        AuthProvider.GOOGLE,
        "John!@#Doe",
      );
      expect(result).toBe("JohnDoe");
    });

    test("truncates display name to 40 characters", () => {
      const result = UserService.generateSocialUsername(
        AuthProvider.GITHUB,
        "A".repeat(100),
      );
      expect(result.length).toBeLessThanOrEqual(40);
    });

    test("pads result to at least 6 characters", () => {
      const result = UserService.generateSocialUsername(
        AuthProvider.FACEBOOK,
        "ab",
      );
      expect(result.length).toBeGreaterThanOrEqual(6);
    });

    test("falls back to provider-based name when displayName is null", () => {
      const result = UserService.generateSocialUsername(
        AuthProvider.GOOGLE,
        null,
      );
      expect(result).toMatch(/^google_/);
      expect(result.length).toBeGreaterThanOrEqual(6);
    });

    test("falls back to provider-based name when displayName is empty", () => {
      const result = UserService.generateSocialUsername(
        AuthProvider.GITHUB,
        "",
      );
      expect(result).toMatch(/^github_/);
      expect(result.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("findOrCreateSocialUser", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("returns existing user when provider and socialId match", async () => {
      const existing = await User.create({
        username: "socialuser",
        provider: AuthProvider.GOOGLE,
        socialId: "google-123",
        email: "social@example.com",
        emailConfirmed: true,
        password: undefined,
      });

      const result = await UserService.findOrCreateSocialUser(
        AuthProvider.GOOGLE,
        "google-123",
        "social@example.com",
        "Social User",
      );

      expect(result.id).toBe(existing.id);
      expect(MailService.sendWelcomeEmail).not.toHaveBeenCalled();
      expect(MailService.sendUserRegistrationNotice).not.toHaveBeenCalled();
      expect(NotificationService.createOne).not.toHaveBeenCalled();
    });

    test("creates new user when provider and socialId do not match", async () => {
      const result = await UserService.findOrCreateSocialUser(
        AuthProvider.GOOGLE,
        "new-google-id",
        "newuser@example.com",
        "New User",
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe(AuthProvider.GOOGLE);
      expect(result.socialId).toBe("new-google-id");
      expect(result.email).toBe("newuser@example.com");
      expect(result.emailConfirmed).toBe(true);
      expect(MailService.sendWelcomeEmail).toHaveBeenCalledWith(
        "NewUser",
        result.id,
        "newuser@example.com",
        "en",
      );
      expect(MailService.sendUserRegistrationNotice).toHaveBeenCalledWith(
        "NewUser",
        result.id,
        "newuser@example.com",
      );
      expect(NotificationService.createOne).toHaveBeenCalledWith(
        "i18nTranslation",
        "i18nTranslation",
        result.id,
      );
    });

    test("generates unique username when display name collides", async () => {
      await User.create({
        username: "NewUser",
        provider: AuthProvider.GOOGLE,
        socialId: "existing-google-id",
        email: "existing@example.com",
        emailConfirmed: true,
        password: undefined,
      });

      const result = await UserService.findOrCreateSocialUser(
        AuthProvider.GOOGLE,
        "another-google-id",
        "another@example.com",
        "NewUser",
      );

      expect(result).toBeDefined();
      expect(result.username).not.toBe("NewUser");
      expect(MailService.sendWelcomeEmail).toHaveBeenCalledWith(
        result.username,
        result.id,
        "another@example.com",
        "en",
      );
      expect(MailService.sendUserRegistrationNotice).toHaveBeenCalled();
      expect(NotificationService.createOne).toHaveBeenCalled();
    });

    test("forwards locale to notifications", async () => {
      const result = await UserService.findOrCreateSocialUser(
        AuthProvider.GOOGLE,
        "locale-test-id",
        "locale@example.com",
        "Locale User",
        "de",
      );

      expect(MailService.sendWelcomeEmail).toHaveBeenCalledWith(
        "LocaleUser",
        result.id,
        "locale@example.com",
        "de",
      );
      expect(NotificationService.createOne).toHaveBeenCalledWith(
        "i18nTranslation",
        "i18nTranslation",
        result.id,
      );
    });

    test("handles missing email", async () => {
      const result = await UserService.findOrCreateSocialUser(
        AuthProvider.GITHUB,
        "github-no-email",
        undefined,
        "No Email User",
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe(AuthProvider.GITHUB);
      expect(result.socialId).toBe("github-no-email");
      expect(result.email).toBeUndefined();
      expect(result.emailConfirmed).toBe(true);
      expect(MailService.sendWelcomeEmail).not.toHaveBeenCalled();
      expect(MailService.sendUserRegistrationNotice).toHaveBeenCalled();
      expect(NotificationService.createOne).toHaveBeenCalled();
    });

    test("handles missing display name", async () => {
      const result = await UserService.findOrCreateSocialUser(
        AuthProvider.FACEBOOK,
        "fb-noname",
        "fb@example.com",
        null,
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe(AuthProvider.FACEBOOK);
      expect(result.socialId).toBe("fb-noname");
      expect(result.username).toMatch(/^facebook_/);
      expect(MailService.sendWelcomeEmail).toHaveBeenCalledWith(
        result.username,
        result.id,
        "fb@example.com",
        "en",
      );
      expect(MailService.sendUserRegistrationNotice).toHaveBeenCalled();
      expect(NotificationService.createOne).toHaveBeenCalled();
    });
  });
});
