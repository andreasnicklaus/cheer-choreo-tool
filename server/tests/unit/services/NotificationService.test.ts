import { describe, test, expect } from "@jest/globals";
import NotificationService from "@/services/NotificationService";
import NotificationModel from "@/db/models/notification";
import User from "@/db/models/user";

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

let user = { id: "test-id" };

describe("NotificationService", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    user = await User.create({
      username: "test-username",
      password: "test-password",
    });
  });

  afterEach(async () => {
    await Promise.all([NotificationModel.destroy({ where: {} })]);
    await User.destroy({ where: {}, force: true });
  });

  test("getAll returns notifications for valid user", async () => {
    await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      UserId: user.id,
    });
    const result = await NotificationService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await NotificationService.getAll("invalid-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("findById returns notification for valid id/user", async () => {
    const notification = await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      UserId: user.id,
    });
    const result = await NotificationService.findById(notification.id, user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(notification.id);
    }
  });

  test("findById returns null for invalid id", async () => {
    const result = await NotificationService.findById("invalid-id", "user-id");
    expect(result).toBeNull();
  });

  test("createForAll creates a notification for all users", async () => {
    await NotificationService.createForAll(
      "Title for test-case",
      "Message for test-case",
    );
    expect((await NotificationService.getAll(user.id)).length).toBe(1);
  });

  test("createOne creates a notification for a user", async () => {
    await NotificationService.createOne(
      "Title for test-case",
      "Message for test-case",
      user.id,
    );
    expect((await NotificationService.getAll(user.id)).length).toBe(1);
  });

  test("findOrCreate creates a notification for a user", async () => {
    await NotificationService.findOrCreate(
      "Title for test-case",
      "Message for test-case",
      user.id,
    );
    expect((await NotificationService.getAll(user.id)).length).toBe(1);
  });

  test("markRead sets read to true", async () => {
    const notification = await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      UserId: user.id,
    });
    const updatedNotification = await NotificationService.markRead(
      notification.id,
      user.id,
    );
    expect(updatedNotification.read).toBeTruthy();
  });

  test("markUnread sets read to false", async () => {
    const notification = await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      read: true,
      UserId: user.id,
    });
    expect(notification.read).toBeTruthy();
    const updatedNotification = await NotificationService.markUnread(
      notification.id,
      user.id,
    );
    expect(updatedNotification.read).toBeFalsy();
  });

  test("update throws for an invalid id", async () => {
    expect(
      NotificationService.update("invalid-id", user.id, { read: true }),
    ).rejects.toThrow();
  });

  test("remove should delete notification", async () => {
    const notification = await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      UserId: user.id,
    });
    expect((await NotificationService.getAll(user.id)).length).toBe(1);
    await NotificationService.remove(notification.id, user.id);
    expect((await NotificationService.getAll(user.id)).length).toBe(0);
  });

  test("remove on non-existing notification should throw", async () => {
    expect(() =>
      NotificationService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });

  test("getReadPercentage returns correct percentage", async () => {
    await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      UserId: user.id,
    });
    await NotificationModel.create({
      title: "Title for test-case",
      message: "Message for test-case",
      UserId: user.id,
      read: true,
    });
    expect(await NotificationService.getReadPercentage()).toBe(50);
  });
});
