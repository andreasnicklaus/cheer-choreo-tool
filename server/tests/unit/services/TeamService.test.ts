import { describe, test, expect } from "@jest/globals";
import TeamService from "@/services/TeamService";
import Team from "@/db/models/team";
import User from "@/db/models/user";
import Club from "@/db/models/club";
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

describe("TeamService", () => {
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
    await Team.destroy({ where: {} });
    await User.destroy({ where: {}, force: true });
    await Club.destroy({ where: {} });
    await Season.destroy({ where: {} });
  });

  test("getAll returns teams for valid user", async () => {
    const team = await Team.create({ name: "TestTeam", UserId: user.id });
    const result = await TeamService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(team.id);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await TeamService.getAll("invalid-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("findByName returns team for valid name/user", async () => {
    const team = await Team.create({ name: "TestTeam", UserId: user.id });
    const result = await TeamService.findByName("TestTeam", user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(team.id);
  });

  test("findByName returns empty for invalid name", async () => {
    const result = await TeamService.findByName("InvalidTeam", "user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("findById returns team for valid id/user", async () => {
    const team = await Team.create({ name: "TestTeam", UserId: user.id });
    const result = await TeamService.findById(team.id, user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(team.id);
    }
  });

  test("findById returns null for invalid id", async () => {
    const result = await TeamService.findById("invalid-id", "user-id");
    expect(result).toBeNull();
  });

  test("getCount returns correct count", async () => {
    await Team.create({ name: "TestTeam", UserId: user.id });
    await Team.create({ name: "TestTeam2", UserId: user.id });
    const result = await TeamService.getCount();
    expect(result).toBe(2);
  });

  test("getTrend returns correct count", async () => {
    await Team.create({ name: "TestTeam", UserId: user.id });
    await Team.create({ name: "TestTeam2", UserId: user.id });
    const result = await TeamService.getTrend();
    expect(result).toBe(2);
  });

  test("getTrend creates a new team", async () => {
    const club = await Club.create({
      name: "test-club",
    });
    const season = await Season.create({
      name: "test-season",
    });
    const team = await TeamService.create(
      "test-team",
      club.id,
      season.id,
      user.id,
    );
    expect(team).toBeDefined();
    expect(team).not.toBeNull();
    expect(team?.id).toStrictEqual(expect.any(String));
  });

  test("findOrCreate creates or returns existing team", async () => {
    const club = await Club.create({
      name: "test-club",
    });
    const team = await TeamService.findOrCreate("test-team", club.id, user.id);
    expect(team).toBeDefined();
    expect(team).not.toBeNull();
    expect(team?.id).toStrictEqual(expect.any(String));

    const foundTeam = await TeamService.findOrCreate(
      "test-team",
      club.id,
      user.id,
    );
    expect(foundTeam.id).toEqual(team.id);
  });

  test("update updates a team", async () => {
    const team = await Team.create({ name: "test-team", UserId: user.id });
    const updatedTeam = await TeamService.update(
      team.id,
      { name: "updated-name" },
      user.id,
    );
    expect(updatedTeam).toBeDefined();
    expect(updatedTeam?.id).toBe(team.id);
    expect(updatedTeam?.name).toBe("updated-name");
  });

  test("update throws for invalid id", async () => {
    expect(
      TeamService.update("invalid-id", { name: "updated-name" }, user.id),
    ).rejects.toThrow();
  });

  test("remove should delete team", async () => {
    const team = await Team.create({ name: "test-team", UserId: user.id });
    expect(await TeamService.getCount()).toBe(1);
    await TeamService.remove(team.id, user.id);
    expect(await TeamService.getCount()).toBe(0);
  });

  test("remove on non-existing team should throw", async () => {
    expect(() =>
      TeamService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
