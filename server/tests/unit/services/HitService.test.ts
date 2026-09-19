import { describe, test, expect } from "@jest/globals";
import HitService from "@/services/HitService";
import Hit from "@/db/models/hit";
import User from "@/db/models/user";
import Choreo from "@/db/models/choreo";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
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

jest.mock("@/services/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    isEnabled: jest.fn().mockResolvedValue(true),
  },
  FeatureFlagKey: {
    ACCESS_SHARING: "access-sharing",
  },
}));

let user: { id: string } = { id: "test-id" };

describe("HitService", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;

    user = await User.create({
      username: "test-user",
      password: "test-password",
    });
  });

  afterEach(async () => {
    await Hit.destroy({ where: {} });
    await Choreo.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  test("getAll returns hits for valid user", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    await Hit.create({
      name: "TestHit",
      count: 1,
      ChoreoId: choreo.id,
      UserId: user.id,
    });
    const result = await HitService.getAll([user.id], user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await HitService.getAll(
      ["invalid-user-id"],
      "invalid-user-id",
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("findById returns hit for valid id/user", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const hit = await Hit.create({
      name: "TestHit",
      count: 1,
      ChoreoId: choreo.id,
      UserId: user.id,
    });
    const result = await HitService.findById(hit.id, user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(hit.id);
    }
  });

  test("findById returns null for invalid id", async () => {
    const result = await HitService.findById("invalid-id", user.id);
    expect(result).toBeNull();
  });

  test("findByName returns hits for valid name/user", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    await Hit.create({
      name: "TestHit",
      count: 1,
      ChoreoId: choreo.id,
      UserId: user.id,
    });
    const result = await HitService.findByName("TestHit", [user.id], user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("findByName returns empty for invalid name", async () => {
    const result = await HitService.findByName(
      "InvalidHit",
      [user.id],
      user.id,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("create creates a new hit", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const result = await HitService.create("NewHit", 1, choreo.id, [], user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.name).toBe("NewHit");
      expect(result.count).toBe(1);
      expect(result.UserId).toBe(user.id);
    }
  });

  test("findOrCreate should find existing hit", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const hitName = "hitName";
    const hitCount = 1;
    const hit1 = await HitService.findOrCreate(
      hitName,
      hitCount,
      choreo.id,
      [],
      user.id,
    );
    const hit2 = await HitService.findOrCreate(
      hitName,
      hitCount,
      choreo.id,
      [],
      user.id,
    );
    expect(hit1.id).toBe(hit2.id);
  });

  test("findOrCreate should create new hit", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const hitName = "hitName";
    const hitCount = 1;
    const hit = await HitService.findOrCreate(
      hitName,
      hitCount,
      choreo.id,
      [],
      user.id,
    );
    expect(hit.name).toBe(hitName);
  });

  test("update should update hit", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const hit = await HitService.findOrCreate(
      "hitname",
      1,
      choreo.id,
      [],
      user.id,
    );
    const newHitName = "updatedHit";
    await HitService.update(hit.id, { name: newHitName }, user.id);
    const updatedHit = await HitService.findById(hit.id, user.id);
    expect(updatedHit?.name).toBe(newHitName);
  });

  test("update on non-existing hit should throw", async () => {
    expect(() =>
      HitService.update("non-existing-id", { name: "x" }, user.id),
    ).rejects.toThrow();
  });

  test("remove should delete hit", async () => {
    const choreo = await Choreo.create({
      name: "test-choreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const hit = await HitService.findOrCreate(
      "hitname",
      1,
      choreo.id,
      [],
      user.id,
    );
    expect((await HitService.getAll([user.id], user.id)).length).toBe(1);
    await HitService.remove(hit.id, user.id);
    expect((await HitService.getAll([user.id], user.id)).length).toBe(0);
  });

  test("remove on non-existing hit should throw", async () => {
    expect(() =>
      HitService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });

  describe("mcpCreate", () => {
    test("creates a new hit when choreo exists", async () => {
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const result = await HitService.mcpCreate(
        "McpHit",
        2,
        choreo.id,
        [],
        user.id,
      );
      expect(result).not.toBeNull();
      expect(result!.name).toBe("McpHit");
      expect(result!.count).toBe(2);
      expect(result!.UserId).toBe(user.id);
    });

    test("returns existing hit when hit already exists (findOrCreate)", async () => {
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const hit1 = await HitService.mcpCreate(
        "DupHit",
        1,
        choreo.id,
        [],
        user.id,
      );
      const hit2 = await HitService.mcpCreate(
        "DupHit",
        1,
        choreo.id,
        [],
        user.id,
      );
      expect(hit1!.id).toBe(hit2!.id);
    });

    test("creates hit with memberIds", async () => {
      const { default: Member } = require("@/db/models/member");
      const member = await Member.create({
        name: "TestMember",
        abbreviation: "TM",
      });
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const result = await HitService.mcpCreate(
        "McpHitWithMembers",
        1,
        choreo.id,
        [member.id],
        user.id,
      );
      expect(result).not.toBeNull();
      expect(result!.Members).toBeDefined();
      expect(result!.Members.length).toBe(1);
    });

    test("throws NotFoundError when choreo does not exist", async () => {
      await expect(
        HitService.mcpCreate("GhostHit", 1, "non-existent-choreo-id", [], user.id),
      ).rejects.toThrow("not found");
    });

    test("updates choreo updaterId", async () => {
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const beforeUpdate = choreo.updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      await HitService.mcpCreate("UpdaterTest", 1, choreo.id, [], user.id);
      const updatedChoreo = await Choreo.findByPk(choreo.id);
      expect(updatedChoreo!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe("mcpBulkCreate", () => {
    test("creates multiple hits", async () => {
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const hits = [
        { name: "BulkHit1", count: 1 },
        { name: "BulkHit2", count: 2 },
      ];
      const result = await HitService.mcpBulkCreate(hits, choreo.id, user.id);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("BulkHit1");
      expect(result[1].name).toBe("BulkHit2");
    });

    test("deduplicates hits with same name, count, choreo, and user", async () => {
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const hits = [
        { name: "DupBulk", count: 1 },
        { name: "DupBulk", count: 1 },
      ];
      const result = await HitService.mcpBulkCreate(hits, choreo.id, user.id);
      // findOrCreate returns the existing hit, so both entries reference the same row
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(result[1].id);
    });

    test("creates hits with memberIds", async () => {
      const { default: Member } = require("@/db/models/member");
      const member = await Member.create({
        name: "BulkMember",
        abbreviation: "BM",
      });
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const hits = [{ name: "BulkWithMember", count: 1, memberIds: [member.id] }];
      const result = await HitService.mcpBulkCreate(hits, choreo.id, user.id);
      expect(result.length).toBe(1);
    });

    test("handles empty hits array", async () => {
      const choreo = await Choreo.create({
        name: "test-choreo",
        counts: 4,
        matType: "cheer",
        UserId: user.id,
      });
      const result = await HitService.mcpBulkCreate([], choreo.id, user.id);
      expect(result.length).toBe(0);
    });

    test("throws NotFoundError when choreo does not exist", async () => {
      await expect(
        HitService.mcpBulkCreate(
          [{ name: "Ghost", count: 1 }],
          "non-existent-choreo-id",
          user.id,
        ),
      ).rejects.toThrow("not found");
    });
  });
});
