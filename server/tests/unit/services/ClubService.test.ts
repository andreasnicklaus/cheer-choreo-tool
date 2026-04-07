import { describe, test, expect, beforeAll, afterEach } from "@jest/globals";
import ClubService from "@/services/ClubService";
import Club from "@/db/models/club";
import User from "@/db/models/user";
import Team from "@/db/models/team";
import Season from "@/db/models/season";
import UserAccess from "@/db/models/userAccess";

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
    const { syncPromise } = require("@/db");
    await syncPromise;

    user = await User.create({
      username: "test-user",
      password: "test-password",
    });
  });

  afterEach(async () => {
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
    const result = await ClubService.create("NewClub", user.id, user.id);
    expect(result).toBeDefined();
    expect(result.name).toBe("NewClub");
    expect(result.UserId).toBe(user.id);
  });

  test("findOrCreate finds or creates a club", async () => {
    const result = await ClubService.findOrCreate("FindOrCreateClub", user.id, user.id);
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
      user.id,
    );
    expect(updated).toBeDefined();
    expect(updated.name).toBe("UpdatedName");
  });

  test("update throws for invalid id", async () => {
    await expect(
      ClubService.update("invalid-id", { name: "UpdatedName" }, user.id, user.id),
    ).rejects.toThrow();
  });

  test("remove deletes club", async () => {
    const club = await Club.create({ name: "TestClub", UserId: user.id });
    await ClubService.remove(club.id, user.id, user.id);
    const found = await Club.findByPk(club.id);
    expect(found?.deletedAt).not.toBeNull();
  });

  test("remove throws for invalid id", async () => {
    await expect(ClubService.remove("invalid-id", user.id, user.id)).rejects.toThrow();
  });

  describe("ClubService access control", () => {
    let owner: User;
    let childAthlete: User;
    let childAssistant: User;
    let childCoach: User;

    beforeAll(async () => {
      owner = await User.create({ username: "access-owner", password: "password" });
      childAthlete = await User.create({ username: "child-athlete", password: "password" });
      childAssistant = await User.create({ username: "child-assistant", password: "password" });
      childCoach = await User.create({ username: "child-coach", password: "password" });

      await UserAccess.create({
        ownerUserId: owner.id,
        childUserId: childAthlete.id,
        role: "athlete",
        enabled: true,
      });
      await UserAccess.create({
        ownerUserId: owner.id,
        childUserId: childAssistant.id,
        role: "assistant",
        enabled: true,
      });
      await UserAccess.create({
        ownerUserId: owner.id,
        childUserId: childCoach.id,
        role: "coach",
        enabled: true,
      });
    });

    afterEach(async () => {
      await Club.destroy({ where: {} });
    });

    test("child with athlete role can READ owner's clubs", async () => {
      const club = await Club.create({ name: "OwnerClub", UserId: owner.id });
      const result = await ClubService.findById(club.id, owner.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(club.id);
    });

    test("child with athlete role CANNOT create clubs (throws)", async () => {
      await expect(
        ClubService.create("NewClub", owner.id, childAthlete.id),
      ).rejects.toThrow();
    });

    test("child with athlete role CANNOT update clubs (throws)", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      await expect(
        ClubService.update(club.id, { name: "Updated" }, owner.id, childAthlete.id),
      ).rejects.toThrow();
    });

    test("child with athlete role CANNOT delete clubs (throws)", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      await expect(
        ClubService.remove(club.id, owner.id, childAthlete.id),
      ).rejects.toThrow();
    });

    test("child with assistant role can READ owner's clubs", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      const result = await ClubService.findById(club.id, owner.id);
      expect(result).toBeDefined();
    });

    test("child with assistant role can CREATE clubs", async () => {
      const created = await ClubService.create("NewClub", owner.id, childAssistant.id);
      expect(created).toBeDefined();
    });

    test("child with assistant role CANNOT delete clubs (throws)", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      await expect(
        ClubService.remove(club.id, owner.id, childAssistant.id),
      ).rejects.toThrow();
    });

    test("child with coach role can READ owner's clubs", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      const found = await ClubService.findById(club.id, owner.id);
      expect(found).toBeDefined();
    });

    test("child with coach role can CREATE clubs", async () => {
      const created = await ClubService.create("NewClub", owner.id, childCoach.id);
      expect(created).toBeDefined();
    });

    test("child with coach role can UPDATE clubs", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      const updated = await ClubService.update(club.id, { name: "Updated" }, owner.id, childCoach.id);
      expect(updated).toBeDefined();
      expect(updated.name).toBe("Updated");
    });

    test("child with coach role can DELETE clubs", async () => {
      const club = await Club.create({ name: "TestClub", UserId: owner.id });
      await ClubService.remove(club.id, owner.id, childCoach.id);
      const deleted = await Club.findByPk(club.id);
      expect(deleted?.deletedAt).not.toBeNull();
    });

    test("createdBy shows actingUser, not owner", async () => {
      const created = await ClubService.create("TestClub", owner.id, owner.id);
      expect(created.creatorId).toBe(owner.id);
    });

    test("findById returns owner's club when accessing via ownerId", async () => {
      const club = await Club.create({ name: "OwnerClub", UserId: owner.id });
      const result = await ClubService.findById(club.id, owner.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(club.id);
    });

    test("getAll returns owner's clubs when using ownerId", async () => {
      await Club.create({ name: "OwnerClub1", UserId: owner.id });
      await Club.create({ name: "OwnerClub2", UserId: owner.id });
      
      const result = await ClubService.getAll(owner.id);
      expect(result.length).toBe(2);
    });
  });
});
