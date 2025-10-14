import { describe, test, expect } from "@jest/globals";
import SeasonTeamService from "@/services/SeasonTeamService";
import SeasonTeam from "@/db/models/seasonTeam";
import User from "@/db/models/user";
import Team from "@/db/models/team";
import Season from "@/db/models/season";
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

describe("SeasonTeamService", () => {
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
    await SeasonTeam.destroy({ where: {} });
    await User.destroy({ where: {}, force: true });
  });

  test("findById returns seasonTeam for valid id/user", async () => {
    const seasonTeam = await SeasonTeam.create({ UserId: user.id });
    const result = await SeasonTeamService.findById(seasonTeam.id, user.id);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe(seasonTeam.id);
    }
  });

  test("findById returns null for invalid id", async () => {
    const result = await SeasonTeamService.findById("invalid-id", user.id);
    expect(result).toBeNull();
  });

  test("getAll returns all seasonTeams", async () => {
    await SeasonTeam.create({ UserId: user.id });
    await SeasonTeam.create({ UserId: user.id });
    const result = await SeasonTeamService.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test("getCount returns correct number", async () => {
    await SeasonTeam.create({ UserId: user.id });
    const count = await SeasonTeamService.getCount();
    expect(typeof count).toBe("number");
    expect(count).toBe(1);
  });

  test("getTrend returns correct trend", async () => {
    await SeasonTeam.create({ UserId: user.id, createdAt: new Date() });
    const trend = await SeasonTeamService.getTrend();
    expect(typeof trend).toBe("number");
    expect(trend).toBeGreaterThanOrEqual(0);
  });

  test("create creates a new SeasonTeam", async () => {
    const team = await Team.create({ name: "test-team" });
    const seasons = await Season.create({ name: "test-season" });
    const season = await SeasonTeamService.create(
      team.id,
      seasons.id,
      [],
      user.id,
    );
    expect(season?.id).toBeDefined();
    expect(season).toBeDefined();
    expect(season?.TeamId).toBe(team.id);
  });

  test("copyMemberIntoSeasonTeam copies a member into a new SeasonTeam", async () => {
    const team = await Team.create({ name: "test-team" });
    const season = await Season.create({ name: "test-season" });
    const member = await Member.create({
      name: "test-member",
      abbreviation: "tm",
      UserId: user.id,
    });
    const seasonTeam = await SeasonTeam.create({
      TeamId: team.id,
      SeasonId: season.id,
      UserId: user.id,
    });
    expect((await seasonTeam.getMembers()).length).toBe(0);

    await SeasonTeamService.copyMemberIntoSeasonTeam(
      seasonTeam.id,
      member.id,
      user.id,
    );
    const updatedSeasonTeam = await SeasonTeam.findByPk(seasonTeam.id);
    expect(updatedSeasonTeam).toBeDefined();
    if (updatedSeasonTeam)
      expect((await updatedSeasonTeam.getMembers()).length).toBe(1);
  });

  test("copyMembersIntoSeasonTeam copies a member into a new SeasonTeam", async () => {
    const team = await Team.create({ name: "test-team" });
    const season = await Season.create({ name: "test-season" });
    const member = await Member.create({
      name: "test-member",
      abbreviation: "tm",
      UserId: user.id,
    });
    const seasonTeam = await SeasonTeam.create({
      TeamId: team.id,
      SeasonId: season.id,
      UserId: user.id,
    });
    expect((await seasonTeam.getMembers()).length).toBe(0);

    await SeasonTeamService.copyMembersIntoSeasonTeam(
      seasonTeam.id,
      [member.id],
      user.id,
    );
    const updatedSeasonTeam = await SeasonTeam.findByPk(seasonTeam.id);
    expect(updatedSeasonTeam).toBeDefined();
    if (updatedSeasonTeam)
      expect((await updatedSeasonTeam.getMembers()).length).toBe(1);
  });

  test("remove should delete seasonTeam", async () => {
    const season = await Season.create({ name: "test-season" });
    const seasonTeam = await SeasonTeam.create({
      UserId: user.id,
      SeasonId: season.id,
    });
    expect((await SeasonTeamService.getAll()).length).toBe(1);
    await SeasonTeamService.remove(seasonTeam.id, user.id);
    expect((await SeasonTeamService.getAll()).length).toBe(0);
  });

  test("remove on non-existing seasonTeam should throw", async () => {
    expect(() =>
      SeasonTeamService.remove("non-existing-id", user.id),
    ).rejects.toThrow();
  });
});
