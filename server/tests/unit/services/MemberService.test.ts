import { describe, test, expect } from "@jest/globals";
import MemberService from "@/services/MemberService";
import Member from "@/db/models/member";
import User from "@/db/models/user";
import SeasonTeam from "@/db/models/seasonTeam";

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

describe("MemberService", () => {
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
    await Promise.all([
      Member.destroy({ where: {} }),
      SeasonTeam.destroy({ where: {} }),
      User.destroy({ where: {} }),
    ]);
  });

  test("getAll returns members for valid user", async () => {
    await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    const result = await MemberService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await MemberService.getAll("invalid-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("findById returns member for valid id/user", async () => {
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    const result = await MemberService.findById(member.id, user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(member.id);
    }
  });

  test("findById returns null for invalid id", async () => {
    const result = await MemberService.findById("invalid-id", user.id);
    expect(result).toBeNull();
  });

  test("getCount returns correct number", async () => {
    await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    const count = await MemberService.getCount();
    expect(typeof count).toBe("number");
    expect(count).toBe(1);
  });

  test("getTrend returns correct trend", async () => {
    await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    const trend = await MemberService.getTrend();
    expect(typeof trend).toBe("number");
    expect(trend).toBeGreaterThanOrEqual(0);
  });

  test("create creates a new Member", async () => {
    const seasonTeam = await SeasonTeam.create();
    const member = await MemberService.create(
      "TestMember",
      "Testi",
      null,
      seasonTeam.id,
      user.id,
    );
    expect(member.id).toBeDefined();
    expect(member.name).toBe("TestMember");
  });

  test("findOrCreate creates a new Member", async () => {
    const seasonTeam = await SeasonTeam.create();
    const member = await MemberService.findOrCreate(
      "TestMember",
      "TestNickname",
      null,
      seasonTeam.id,
      user.id,
    );
    expect(member.id).toBeDefined();
    expect(member.name).toBe("TestMember");
  });

  test("update updates a ,ember", async () => {
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    const updatedMember = await MemberService.update(
      member.id,
      { abbreviation: "test-abbreviation" },
      user.id,
    );
    expect(updatedMember).toBeDefined();
    expect(updatedMember?.id).toBe(member.id);
    expect(updatedMember?.abbreviation).toBe("test-abbreviation");
  });

  test("update throws for invalid id", async () => {
    expect(
      MemberService.update(
        "invalid-id",
        { abbreviation: "test-abbreviation" },
        user.id,
      ),
    ).rejects.toThrow();
  });

  test("remove should delete member", async () => {
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    expect(await MemberService.findById(member.id, user.id)).not.toBeNull();
    await MemberService.remove(member.id, user.id);
    expect(await MemberService.findById(member.id, user.id)).toBeNull();
  });

  test("remove on non-existing member should throw", async () => {
    expect(() =>
      MemberService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
