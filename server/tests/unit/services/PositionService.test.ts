import { describe, test, expect } from "@jest/globals";
import PositionService from "@/services/PositionService";
import Position from "@/db/models/position";
import User from "@/db/models/user";
import Lineup from "@/db/models/lineup";
import Member from "@/db/models/member";

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

describe("PositionService", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    user = await User.create({
      username: "test-username",
      password: "tets-password",
    });
  });

  afterEach(async () => {
    await Promise.all([
      Lineup.destroy({ where: {} }),
      Member.destroy({ where: {} }),
      Position.destroy({ where: {} }),
      User.destroy({ where: {}, force: true }),
    ]);
  });

  test("create creates a new position", async () => {
    const result = await PositionService.create(1, 2, user.id);
    expect(result).toBeDefined();
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect(result.UserId).toBe(user.id);
  });

  test("findOrCreate finds or creates a position", async () => {
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
    });
    const result = await PositionService.findOrCreate(
      1,
      2,
      lineup.id,
      member.id,
      user.id,
    );
    expect(result).toBeDefined();
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect(result.UserId).toBe(user.id);
  });

  test("findByLineupId finds a position", async () => {
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
    });
    const position = await Position.create({
      x: 1,
      y: 1,
      LineupId: lineup.id,
      MemberId: member.id,
      UserId: user.id,
    });
    const result = await PositionService.findByLineupId(lineup.id, user.id);
    expect(result).toBeDefined();
    expect(result[0].id).toBe(position.id);
    expect(result.length).toBe(1);
  });

  test("findById finds a position", async () => {
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
    });
    const position = await Position.create({
      x: 1,
      y: 1,
      LineupId: lineup.id,
      MemberId: member.id,
      UserId: user.id,
    });
    const result = await PositionService.findById(position.id, user.id);
    expect(result).toBeDefined();
    expect(result?.id).toBe(position.id);
  });

  test("update updates a position", async () => {
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
    });
    const position = await Position.create({
      x: 1,
      y: 1,
      UserId: user.id,
      LineupId: lineup.id,
    });
    const updatedPosition = await PositionService.update(
      position.id,
      lineup.id,
      { y: 2, timeOfManualUpdate: new Date() },
      user.id,
    );
    expect(updatedPosition).toBeDefined();
    expect(updatedPosition?.id).toBe(position.id);
    expect(updatedPosition?.y).toBe(2);
  });

  test("update throws for invalid id", async () => {
    expect(
      PositionService.update("invalid-id", "invalid-id", { y: 2 }, user.id),
    ).rejects.toThrow();
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
    });
    expect(
      PositionService.update("invalid-id", lineup.id, { y: 2 }, user.id),
    ).rejects.toThrow();
  });

  test("remove should delete position", async () => {
    const position = await Position.create({
      x: 1,
      y: 1,
      UserId: user.id,
    });
    expect(await PositionService.findById(position.id, user.id)).not.toBeNull();
    await PositionService.remove(position.id, user.id);
    expect(await PositionService.findById(position.id, user.id)).toBeNull();
  });

  test("remove on non-existing member should throw", async () => {
    expect(() =>
      PositionService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
