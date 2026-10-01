import { describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import PositionService from "@/services/PositionService";
import LineupService from "@/services/LineupService";
import Position from "@/db/models/position";
import User from "@/db/models/user";
import Lineup from "@/db/models/lineup";
import Member from "@/db/models/member";
import Choreo from "@/db/models/choreo";
import { LineupConflictError } from "@/utils/errors";

jest.mock("@/plugins/winston", () => ({
  logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
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
jest.mock("@/services/FeatureFlagService", () => ({
  __esModule: true,
  default: { isEnabled: jest.fn().mockResolvedValue(true) },
  FeatureFlagKey: { ACCESS_SHARING: "access-sharing" },
}));

let user = { id: "test-id" };

describe("lineup conflict guard", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    user = await User.create({
      username: `guard-user-${Date.now()}-${Math.random()}`,
      password: "guard-password",
    });
  });

  afterEach(async () => {
    await Promise.all([
      Position.destroy({ where: {} }),
      Lineup.destroy({ where: {} }),
      Member.destroy({ where: {} }),
      Choreo.destroy({ where: {} }),
    ]);
  });

  async function makeChoreo() {
    return Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Guard Choreo",
      UserId: user.id,
    });
  }

  test("rejects a lineup update that introduces an overlap", async () => {
    const choreo = await makeChoreo();
    await Lineup.create({
      startCount: 1,
      endCount: 4,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    const b = await Lineup.create({
      startCount: 5,
      endCount: 8,
      UserId: user.id,
      ChoreoId: choreo.id,
    });

    // Moving b's range back to 3-8 makes it overlap a (1-4).
    await expect(
      LineupService.update(b.id, { startCount: 3, endCount: 8 }, user.id),
    ).rejects.toBeInstanceOf(LineupConflictError);

    // Rejection must roll back: b keeps its original range.
    const reloaded = await Lineup.findByPk(b.id);
    expect(reloaded?.startCount).toBe(5);
  });

  test("allows a non-overlapping lineup update", async () => {
    const choreo = await makeChoreo();
    await Lineup.create({
      startCount: 1,
      endCount: 4,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    const b = await Lineup.create({
      startCount: 5,
      endCount: 8,
      UserId: user.id,
      ChoreoId: choreo.id,
    });

    await LineupService.update(b.id, { startCount: 6, endCount: 9 }, user.id);
    const reloaded = await Lineup.findByPk(b.id);
    expect(reloaded?.startCount).toBe(6);
    expect(reloaded?.endCount).toBe(9);
  });

  test("grandfathers a pre-existing overlap (stateless subset check)", async () => {
    const choreo = await makeChoreo();
    // Two lineups that already overlap before any guarded mutation.
    const a = await Lineup.create({
      startCount: 1,
      endCount: 5,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    await Lineup.create({
      startCount: 3,
      endCount: 8,
      UserId: user.id,
      ChoreoId: choreo.id,
    });

    // Touching a without widening the existing overlap is allowed because the
    // pre-existing violation is grandfathered.
    await expect(
      LineupService.update(a.id, { startCount: 1, endCount: 4 }, user.id),
    ).resolves.toBeDefined();
  });

  test("rejects placing a member into two overlapping lineups", async () => {
    const choreo = await makeChoreo();
    const a = await Lineup.create({
      startCount: 1,
      endCount: 4,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    const b = await Lineup.create({
      startCount: 2,
      endCount: 6,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    const member = await Member.create({
      name: "Conflicting",
      abbreviation: "CF",
      UserId: user.id,
    });

    await PositionService.create(10, 10, a.id, member.id, user.id);

    await expect(
      PositionService.create(20, 20, b.id, member.id, user.id),
    ).rejects.toBeInstanceOf(LineupConflictError);

    // The second create must have rolled back.
    const count = await Position.count({ where: { LineupId: b.id } });
    expect(count).toBe(0);
  });

  test("removing a lineup is never blocked by the guard", async () => {
    const choreo = await makeChoreo();
    const a = await Lineup.create({
      startCount: 1,
      endCount: 5,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    await Lineup.create({
      startCount: 3,
      endCount: 8,
      UserId: user.id,
      ChoreoId: choreo.id,
    });

    await expect(LineupService.remove(a.id, user.id)).resolves.not.toThrow();
    expect(await Lineup.findByPk(a.id)).toBeNull();
  });
});
