import { describe, test, expect } from "@jest/globals";
import SeasonService from "@/services/SeasonService";
import Season from "@/db/models/season";
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

describe("SeasonService", () => {
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
    await Promise.all([
      Season.destroy({ where: {} }),
      User.destroy({ where: {}, force: true }),
    ]);
  });

  test("getAll returns seasons for valid user", async () => {
    await Season.create({ name: "TestSeason", year: 2025, UserId: user.id });
    const result = await SeasonService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns all seasons for no user", async () => {
    await Season.create({ name: "TestSeason", year: 2025 });
    const result = await SeasonService.getAll(null);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await SeasonService.getAll("invalid-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("create creates a new season", async () => {
    const result = await SeasonService.create("seasonName", 2025, user.id);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });

  test("getCount returns correct number", async () => {
    await Season.create({ name: "TestSeason", year: 2025, UserId: user.id });
    const count = await SeasonService.getCount();
    expect(typeof count).toBe("number");
    expect(count).toBe(1);
  });

  test("getTrend returns correct trend", async () => {
    await Season.create({
      name: "TestSeason",
      year: 2025,
      UserId: user.id,
      createdAt: new Date(),
    });
    const trend = await SeasonService.getTrend();
    expect(typeof trend).toBe("number");
    expect(trend).toBeGreaterThanOrEqual(0);
  });

  test("update updates a season", async () => {
    const season = await Season.create({
      name: "TestSeason",
      year: 2025,
      UserId: user.id,
    });
    const updatedSeason = await SeasonService.update(
      season.id,
      { year: 2015 },
      user.id,
    );
    expect(updatedSeason).toBeDefined();
    expect(updatedSeason?.id).toBe(season.id);
    expect(updatedSeason?.year).toBe(2015);
  });

  test("update throws for invalid id", async () => {
    expect(
      SeasonService.update("invalid-id", { year: 2015 }, user.id),
    ).rejects.toThrow();
  });

  test("remove should delete season", async () => {
    const season = await Season.create({
      name: "TestSeason",
      year: 2025,
      UserId: user.id,
    });
    expect((await SeasonService.getAll(user.id)).length).toBe(1);
    await SeasonService.remove(season.id, user.id);
    expect((await SeasonService.getAll(user.id)).length).toBe(0);
  });

  test("remove on non-existing member should throw", async () => {
    expect(() =>
      SeasonService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
