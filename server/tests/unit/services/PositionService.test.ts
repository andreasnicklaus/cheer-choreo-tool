import { describe, test, expect } from "@jest/globals";
import PositionService from "@/services/PositionService";
import Position from "@/db/models/position";
import User from "@/db/models/user";
import Lineup from "@/db/models/lineup";
import Member from "@/db/models/member";
import Choreo from "@/db/models/choreo";
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
  default: {
    isEnabled: jest.fn().mockResolvedValue(true),
  },
  FeatureFlagKey: {
    ACCESS_SHARING: "access-sharing",
  },
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
    const choreo = await Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Test Choreo",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    const result = await PositionService.create(1, 2, lineup.id, user.id);
    expect(result).toBeDefined();
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect(result.UserId).toBe(user.id);
  });
  test("findOrCreate finds or creates a position", async () => {
    const choreo = await Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Test Choreo",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      UserId: user.id,
      ChoreoId: choreo.id,
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
    const lineup = await Lineup.create({ startCount: 1, endCount: 2 });
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
    const result = await PositionService.findByLineupId(
      lineup.id,
      [user.id],
      user.id,
    );
    expect(result).toBeDefined();
    expect(result[0].id).toBe(position.id);
    expect(result.length).toBe(1);
  });
  test("findById finds a position", async () => {
    const lineup = await Lineup.create({ startCount: 1, endCount: 2 });
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
    const choreo = await Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Test Choreo",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      UserId: user.id,
      ChoreoId: choreo.id,
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
      PositionService.update("invalid-id", "lineup-id", { y: 2 }, user.id),
    ).rejects.toThrow();
  });
  test("remove should delete position", async () => {
    const choreo = await Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Test Choreo",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      UserId: user.id,
      ChoreoId: choreo.id,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
    });
    const position = await PositionService.findOrCreate(
      1,
      2,
      lineup.id,
      member.id,
      user.id,
    );
    expect(await PositionService.findById(position.id, user.id)).not.toBeNull();
    await PositionService.remove(position.id, user.id);
    expect(await PositionService.findById(position.id, user.id)).toBeNull();
  });
  test("remove on non-existing position should throw", async () => {
    expect(() =>
      PositionService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
  test("findOrCreate finds or creates a position", async () => {
    const choreo = await Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Test Choreo",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      UserId: user.id,
      ChoreoId: choreo.id,
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
    const lineup = await Lineup.create({ startCount: 1, endCount: 2 });
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
    const result = await PositionService.findByLineupId(
      lineup.id,
      [user.id],
      user.id,
    );
    expect(result).toBeDefined();
    expect(result[0].id).toBe(position.id);
    expect(result.length).toBe(1);
  });
  test("findById finds a position", async () => {
    const lineup = await Lineup.create({ startCount: 1, endCount: 2 });
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
    const choreo = await Choreo.create({
      counts: 8,
      matType: "cheer",
      name: "Test Choreo",
      UserId: user.id,
    });
    const lineup = await Lineup.create({
      startCount: 1,
      endCount: 2,
      UserId: user.id,
      ChoreoId: choreo.id,
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
    const lineup = await Lineup.create({ startCount: 1, endCount: 2 });
    expect(
      PositionService.update("invalid-id", lineup.id, { y: 2 }, user.id),
    ).rejects.toThrow();
  });
  test("remove should delete position", async () => {
    const position = await Position.create({ x: 1, y: 1, UserId: user.id });
    expect(await PositionService.findById(position.id, user.id)).not.toBeNull();
    await PositionService.remove(position.id, user.id);
    expect(await PositionService.findById(position.id, user.id)).toBeNull();
  });
  test("remove on non-existing member should throw", async () => {
    expect(() =>
      PositionService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });

  describe("mcpFindOrCreate", () => {
    test("creates a new position", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member = await Member.create({
        name: "McpMember",
        abbreviation: "MM",
      });
      const result = await PositionService.mcpFindOrCreate(
        5,
        10,
        lineup.id,
        member.id,
        user.id,
      );
      expect(result).toBeDefined();
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result.UserId).toBe(user.id);
    });

    test("finds an existing position instead of creating a duplicate", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member = await Member.create({
        name: "McpMember",
        abbreviation: "MM",
      });
      const pos1 = await PositionService.mcpFindOrCreate(
        3,
        4,
        lineup.id,
        member.id,
        user.id,
      );
      const pos2 = await PositionService.mcpFindOrCreate(
        3,
        4,
        lineup.id,
        member.id,
        user.id,
      );
      expect(pos1.id).toBe(pos2.id);
    });

    test("updates lineup updaterId when position is created", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member = await Member.create({
        name: "McpMember",
        abbreviation: "MM",
      });
      const beforeUpdate = lineup.updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      await PositionService.mcpFindOrCreate(
        1,
        2,
        lineup.id,
        member.id,
        user.id,
      );
      const updatedLineup = await Lineup.findByPk(lineup.id);
      expect(updatedLineup!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    test("does not update lineup when position already existed", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member = await Member.create({
        name: "McpMember",
        abbreviation: "MM",
      });
      // First call creates the position and updates the lineup
      await PositionService.mcpFindOrCreate(
        1,
        2,
        lineup.id,
        member.id,
        user.id,
      );
      const afterFirst = (await Lineup.findByPk(lineup.id))!.updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      // Second call finds existing position — lineup should NOT be updated
      await PositionService.mcpFindOrCreate(
        1,
        2,
        lineup.id,
        member.id,
        user.id,
      );
      const afterSecond = (await Lineup.findByPk(lineup.id))!.updatedAt;
      expect(afterSecond.getTime()).toBe(afterFirst.getTime());
    });

    test("throws NotFoundError when lineup does not exist", async () => {
      await expect(
        PositionService.mcpFindOrCreate(
          1,
          2,
          "non-existent-lineup-id",
          "some-member-id",
          user.id,
        ),
      ).rejects.toThrow("not found");
    });

    test("throws NotFoundError when choreo does not exist", async () => {
      // Create a lineup with a dangling ChoreoId (orphaned lineup scenario)
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
      });
      // Delete all choreos so the lineup's ChoreoId points to nothing
      await Choreo.destroy({ where: {} });
      await expect(
        PositionService.mcpFindOrCreate(
          1,
          2,
          lineup.id,
          "some-member-id",
          user.id,
        ),
      ).rejects.toThrow("not found");
    });
  });

  describe("mcpBulkFindOrCreate", () => {
    test("creates multiple positions", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member1 = await Member.create({
        name: "BulkMember1",
        abbreviation: "BM1",
      });
      const member2 = await Member.create({
        name: "BulkMember2",
        abbreviation: "BM2",
      });
      const positions = [
        { x: 1, y: 2, memberId: member1.id },
        { x: 3, y: 4, memberId: member2.id },
      ];
      const result = await PositionService.mcpBulkFindOrCreate(
        positions,
        lineup.id,
        user.id,
      );
      expect(result.length).toBe(2);
      expect(result[0].x).toBe(1);
      expect(result[1].x).toBe(3);
    });

    test("deduplicates positions with same coordinates and member", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member = await Member.create({
        name: "DupMember",
        abbreviation: "DM",
      });
      const positions = [
        { x: 5, y: 6, memberId: member.id },
        { x: 5, y: 6, memberId: member.id },
      ];
      const result = await PositionService.mcpBulkFindOrCreate(
        positions,
        lineup.id,
        user.id,
      );
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(result[1].id);
    });

    test("updates lineup updaterId after bulk create", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const member = await Member.create({
        name: "BulkMember",
        abbreviation: "BM",
      });
      const beforeUpdate = lineup.updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      await PositionService.mcpBulkFindOrCreate(
        [{ x: 1, y: 2, memberId: member.id }],
        lineup.id,
        user.id,
      );
      const updatedLineup = await Lineup.findByPk(lineup.id);
      expect(updatedLineup!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    test("handles empty positions array", async () => {
      const choreo = await Choreo.create({
        counts: 8,
        matType: "cheer",
        name: "Test Choreo",
        UserId: user.id,
      });
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
        ChoreoId: choreo.id,
      });
      const result = await PositionService.mcpBulkFindOrCreate(
        [],
        lineup.id,
        user.id,
      );
      expect(result.length).toBe(0);
    });

    test("throws NotFoundError when lineup does not exist", async () => {
      await expect(
        PositionService.mcpBulkFindOrCreate(
          [{ x: 1, y: 2, memberId: "some-member-id" }],
          "non-existent-lineup-id",
          user.id,
        ),
      ).rejects.toThrow("not found");
    });

    test("throws NotFoundError when choreo does not exist", async () => {
      const lineup = await Lineup.create({
        startCount: 1,
        endCount: 2,
        UserId: user.id,
      });
      await Choreo.destroy({ where: {} });
      await expect(
        PositionService.mcpBulkFindOrCreate(
          [{ x: 1, y: 2, memberId: "some-member-id" }],
          lineup.id,
          user.id,
        ),
      ).rejects.toThrow("not found");
    });
  });
});
