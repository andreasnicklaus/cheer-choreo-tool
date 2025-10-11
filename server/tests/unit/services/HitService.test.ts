import { describe, test, expect } from "@jest/globals";
import HitService from "@/services/HitService";
import Hit from "@/db/models/hit";
import User from "@/db/models/user";
import Choreo from "@/db/models/choreo";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: console.log,
    error: console.error,
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

describe("HitService", () => {
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
    const result = await HitService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await HitService.getAll("invalid-user-id");
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
    const result = await HitService.findByName("TestHit", user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("findByName returns empty for invalid name/user", async () => {
    const result = await HitService.findByName("InvalidHit", user.id);
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
    const updatedAdmin = await HitService.findById(hit.id, user.id);
    expect(updatedAdmin?.name).toBe(newHitName);
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
    expect((await HitService.getAll(user.id)).length).toBe(1);
    await HitService.remove(hit.id, user.id);
    expect((await HitService.getAll(user.id)).length).toBe(0);
  });

  test("remove on non-existing admin should throw", async () => {
    expect(() =>
      HitService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
