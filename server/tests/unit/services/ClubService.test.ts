import { describe, test, expect } from "@jest/globals";
import ClubService from "@/services/ClubService";
import Club from "@/db/models/club";
import User from "@/db/models/user";
import Team from "@/db/models/team";
import Season from "@/db/models/season";

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

describe("ClubService", () => {
  beforeAll(async () => {
    process.env.IsTest = "true";
    const { syncPromise } = require("@/db");
    await syncPromise;

    user = await User.create({
      username: "test-user",
      password: "test-password",
    });
  });

  afterEach(async () => {
    console.log("🚀 ~ afterEach:", afterEach);
    await Club.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Team.destroy({ where: {} });
  });

  test("getAll returns clubs for valid user", async () => {
    const club = await Club.create({ name: "TestClub", UserId: user.id });
    const result = await ClubService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(club.id);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await ClubService.getAll("invalid-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("getCount returns correct number", async () => {
    await Club.create({ name: "TestClub", UserId: user.id });
    const count = await ClubService.getCount();
    expect(typeof count).toBe("number");
    expect(count).toBe(1);
  });

  test("getTrend returns correct trend", async () => {
    await Club.create({
      name: "TestClub",
      UserId: user.id,
    });
    await Club.create({
      name: "TestClub2",
      UserId: user.id,
    });
    const trend = await ClubService.getTrend();
    expect(typeof trend).toBe("number");
    expect(trend).toBe(2);
  });

  test("findById returns club for valid id/user", async () => {
    const club = await Club.create({ name: "TestClub", UserId: user.id });
    const result = await ClubService.findById(club.id, user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(club.id);
    }
  });

  test("findById return null for invalid id", async () => {
    const club = await ClubService.findById("invalid-id", user.id);
    expect(club).toBeNull();
  });

  test("findByName returns club for valid name/user", async () => {
    const club = await Club.create({ name: "TestClub", UserId: user.id });
    const result = await ClubService.findByName("TestClub", user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(club.id);
  });

  test("findByName returns empty for invalid name", async () => {
    const result = await ClubService.findByName("InvalidClub", user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("create creates a new club", async () => {
    await Season.create({
      name: "test-season",
      year: new Date().getFullYear(),
      UserId: undefined,
    });
    const result = await ClubService.create("NewClub", user.id);
    expect(result).toBeDefined();
    expect(result.name).toBe("NewClub");
    expect(result.UserId).toBe(user.id);
  });

  test("findOrCreate finds or creates a club", async () => {
    const result = await ClubService.findOrCreate("FindOrCreateClub", user.id);
    expect(result).toBeDefined();
    expect(result.name).toBe("FindOrCreateClub");
    expect(result.UserId).toBe(user.id);
  });

  test("update updates club", async () => {
    const club = await Club.create({ name: "TestClub", UserId: user.id });
    const updated = await ClubService.update(
      club.id,
      { name: "UpdatedName" },
      user.id,
    );
    expect(updated).toBeDefined();
    expect(updated.name).toBe("UpdatedName");
  });

  test("update throws for invalid id", async () => {
    await expect(
      ClubService.update("invalid-id", { name: "UpdatedName" }, user.id),
    ).rejects.toThrow();
  });

  test("remove deletes club", async () => {
    const club = await Club.create({ name: "TestClub", UserId: user.id });
    await ClubService.remove(club.id, user.id);
    const found = await Club.findByPk(club.id);
    expect(found?.deletedAt).not.toBeNull();
  });

  test("remove throws for invalid id", async () => {
    await expect(ClubService.remove("invalid-id", user.id)).rejects.toThrow();
  });
});
