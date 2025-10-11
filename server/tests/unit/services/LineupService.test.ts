import { describe, test, expect } from "@jest/globals";
import LineupService from "@/services/LineupService";
import Lineup from "@/db/models/lineup";
import User from "@/db/models/user";
import Choreo from "@/db/models/choreo";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
  error: jest.fn(),
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

describe("LineupService", () => {
  beforeAll(async () => {
    process.env.IsTest = "true";
    const { syncPromise } = require("@/db");
    await syncPromise;

    user = await User.create({
      username: "test-username",
      password: "test-password",
    });
  });

  afterEach(async () => {
    await Lineup.destroy({ where: {} });
    await Choreo.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  test("create creates a lineup", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const result = await LineupService.create(1, 2, choreo.id, user.id);
    expect(result).toBeDefined();
    expect(result.startCount).toBe(1);
    expect(result.endCount).toBe(2);
    expect(result.UserId).toBe(user.id);
  });

  test("findOrCreate finds or creates a lineup", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const result = await LineupService.findOrCreate(1, 2, choreo.id, user.id);
    expect(result).toBeDefined();
    expect(result.startCount).toBe(1);
    expect(result.endCount).toBe(2);
    expect(result.UserId).toBe(user.id);
  });

  test("update updates lineup", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      ChoreoId: choreo.id,
      UserId: user.id,
    });
    const updated = await LineupService.update(
      lineup.id,
      { endCount: 3 },
      user.id,
    );
    expect(updated).not.toBeNull();
    if (updated) {
      expect(updated.endCount).toBe(3);
    }
  });
  test("update throws error for invalid lineup id", async () => {
    expect(
      LineupService.update("invalid-lineup-id", { endCount: 3 }, user.id),
    ).rejects.toThrow();
  });

  test("findById should find existing lineup", async () => {
    const notFoundAdmin = await LineupService.findById("", user.id);
    expect(notFoundAdmin).toBeNull();

    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      ChoreoId: choreo.id,
      UserId: user.id,
    });
    const foundLineup = await LineupService.findById(lineup.id, user.id);
    expect(foundLineup).not.toBeNull();
    expect(foundLineup?.endCount).toBe(2);
  });

  test("findByChoreoId should find existing lineup", async () => {
    const notFoundAdmin = await LineupService.findByChoreoId("");
    expect(notFoundAdmin.length).toBe(0);

    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    await Lineup.create({
      startCount: 1,
      endCount: 2,
      ChoreoId: choreo.id,
      UserId: user.id,
    });
    const foundLineup = await LineupService.findByChoreoId(choreo.id);
    expect(foundLineup).not.toBeNull();
    expect(foundLineup?.length).toBe(1);
  });

  test("remove should delete lineup", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const lineup = await LineupService.findOrCreate(1, 2, choreo.id, user.id);
    expect(await LineupService.findById(lineup.id, user.id)).not.toBeNull();
    await LineupService.remove(lineup.id, user.id);
    expect(await LineupService.findById(lineup.id, user.id)).toBeNull();
  });

  test("remove on non-existing admin should throw", async () => {
    expect(() =>
      LineupService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
