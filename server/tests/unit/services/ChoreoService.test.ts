import { describe, test, expect } from "@jest/globals";
import ChoreoService from "@/services/ChoreoService";
import Choreo from "@/db/models/choreo";
import User from "@/db/models/user";
import Member from "@/db/models/member";
import ChoreoParticipation from "@/db/models/choreoParticipation";
import SeasonTeam from "@/db/models/seasonTeam";
import Team from "@/db/models/team";
import Hit from "@/db/models/hit";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
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

describe("ChoreoService", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;

    user = await User.create({
      username: "test-user",
      password: "test-password",
    });
  });

  afterEach(async () => {
    await Promise.all([
      Choreo.destroy({ where: {} }),
      Member.destroy({ where: {} }),
      SeasonTeam.destroy({ where: {} }),
      Team.destroy({ where: {} }),
      Hit.destroy({ where: {} }),
    ]);
  });

  test("addParticipant adds a member to a choreo", async () => {
    const choreo = await Choreo.create({
      name: "AddParticipantChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    await expect(
      ChoreoService.addParticipant(choreo.id, member.id, user.id, "#FF1493"),
    ).resolves.toBeDefined();
    expect(
      await ChoreoParticipation.findOne({
        where: { MemberId: member.id, ChoreoId: choreo.id },
      }),
    ).not.toBeNull();
  });

  test("addParticipant throws for invalid member", async () => {
    const choreo = await Choreo.create({
      name: "AddParticipantChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    await expect(
      ChoreoService.addParticipant(
        choreo.id,
        "invalid-member-id",
        user.id,
        "#FF1493",
      ),
    ).rejects.toThrow();
  });

  test("removeParticipant removes a member from a choreo", async () => {
    const choreo = await Choreo.create({
      name: "RemoveParticipantChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    await ChoreoService.addParticipant(
      choreo.id,
      member.id,
      user.id,
      "#FF1493",
    );

    await ChoreoService.removeParticipant(choreo.id, member.id);

    expect(
      await ChoreoParticipation.findOne({
        where: { MemberId: member.id, ChoreoId: choreo.id },
      }),
    ).toBeNull();
  });

  test("removeParticipant does nothing for invalid member", async () => {
    const choreo = await Choreo.create({
      name: "RemoveParticipantChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    await expect(
      ChoreoService.removeParticipant(choreo.id, "invalid-member-id"),
    ).resolves.toBeUndefined();
  });

  test("replaceParticipant replaces a member in a choreo", async () => {
    const choreo = await Choreo.create({
      name: "ReplaceParticipantChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const member1 = await Member.create({
      name: "Member1",
      abbreviation: "M1",
      UserId: user.id,
    });
    const member2 = await Member.create({
      name: "Member2",
      abbreviation: "M2",
      UserId: user.id,
    });
    await ChoreoService.addParticipant(
      choreo.id,
      member1.id,
      user.id,
      "#FF1493",
    );
    await expect(
      ChoreoService.replaceParticipant(
        choreo.id,
        member2.id,
        member1.id,
        user.id,
      ),
    ).resolves.toBeDefined();
    expect(
      await ChoreoParticipation.findOne({
        where: { MemberId: member1.id, ChoreoId: choreo.id },
      }),
    ).toBeNull();
    expect(
      await ChoreoParticipation.findOne({
        where: { MemberId: member2.id, ChoreoId: choreo.id },
      }),
    ).not.toBeNull();
  });

  test("replaceParticipant throws for invalid remove-id", async () => {
    const choreo = await Choreo.create({
      name: "ReplaceParticipantChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const member2 = await Member.create({
      name: "Member2",
      abbreviation: "M2",
      UserId: user.id,
    });
    await expect(
      ChoreoService.replaceParticipant(
        choreo.id,
        member2.id,
        "invalid-member-id",
        user.id,
      ),
    ).rejects.toThrow();
  });

  test("changeParticipationColor changes color for valid participant", async () => {
    const choreo = await Choreo.create({
      name: "ChangeColorChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    const member = await Member.create({
      name: "TestMember",
      abbreviation: "TM",
      UserId: user.id,
    });
    await ChoreoService.addParticipant(
      choreo.id,
      member.id,
      user.id,
      "#FF1493",
    );
    await expect(
      ChoreoService.changeParticipationColor(choreo.id, member.id, "#00FFFF"),
    ).resolves.toBeDefined();
    const participation = await ChoreoParticipation.findOne({
      where: { MemberId: member.id, ChoreoId: choreo.id },
    });
    expect(participation).toBeDefined();
    expect(participation?.color).toBe("#00FFFF");
  });

  test("changeParticipationColor throws for invalid participant", async () => {
    const choreo = await Choreo.create({
      name: "ChangeColorChoreo",
      counts: 4,
      matType: "cheer",
      UserId: user.id,
    });
    await expect(
      ChoreoService.changeParticipationColor(
        choreo.id,
        "invalid-participant-id",
        "#00FFFF",
      ),
    ).rejects.toThrow();
  });

  test("findBySeasonTeamId returns choreos for valid team/user", async () => {
    const seasonTeam = await SeasonTeam.create({});
    const choreo = await Choreo.create({
      name: "TeamChoreo",
      counts: 5,
      matType: "cheer",
      SeasonTeamId: seasonTeam.id,
      UserId: user.id,
    });
    const result = await ChoreoService.findBySeasonTeamId(
      seasonTeam.id,
      user.id,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(choreo.id);
  });

  test("findBySeasonTeamId returns empty for invalid team/user", async () => {
    await Choreo.create({
      name: "TeamChoreo",
      counts: 5,
      matType: "cheer",
      UserId: user.id,
    });
    const result = await ChoreoService.findBySeasonTeamId(
      "invalid-team-id",
      "invalid-user-id",
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("findOrCreate finds or creates a choreo", async () => {
    const seasonTeam = await SeasonTeam.create({});
    const result = await ChoreoService.findOrCreate(
      "FindOrCreateChoreo",
      7,
      "cheer",
      seasonTeam.id,
      user.id,
    );
    expect(result).toBeDefined();
    expect(result.name).toBe("FindOrCreateChoreo");
    expect(result.counts).toBe(7);
    expect(result.UserId).toBe(user.id);

    const result2 = await ChoreoService.findOrCreate(
      "FindOrCreateChoreo",
      7,
      "cheer",
      seasonTeam.id,
      user.id,
    );
    expect(result2).toBeDefined();
    expect(result2.id).toBe(result.id);
  });

  test("update updates choreo", async () => {
    const choreo = await Choreo.create({
      name: "UpdateChoreo",
      counts: 3,
      matType: "cheer",
      UserId: user.id,
    });
    const updated = await ChoreoService.update(
      choreo.id,
      { name: "UpdatedName" },
      user.id,
    );
    expect(updated).toBeDefined();
    expect(updated.name).toBe("UpdatedName");
  });

  test("update throws for invalid id", async () => {
    await expect(
      ChoreoService.update("invalid-id", { name: "UpdatedName" }, user.id),
    ).rejects.toThrow();
  });

  test("remove deletes choreo", async () => {
    const choreo = await Choreo.create({
      name: "RemoveChoreo",
      counts: 2,
      matType: "cheer",
      UserId: user.id,
    });
    await ChoreoService.remove(choreo.id, user.id);

    const found = await Choreo.findByPk(choreo.id);
    expect(found).toBeNull();
  });

  test("remove throws for invalid id", async () => {
    await expect(ChoreoService.remove("invalid-id", user.id)).rejects.toThrow();
  });

  test("getAll returns choreos for valid user", async () => {
    const choreo = await Choreo.create({
      name: "TestChoreo",
      counts: 8,
      matType: "cheer",
      UserId: user.id,
    });
    const result = await ChoreoService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(choreo.id);
  });

  test("findById returns choreo for valid id/user", async () => {
    const choreo = await Choreo.create({
      name: "TestChoreo",
      counts: 8,
      matType: "cheer",
      UserId: user.id,
    });
    const result = await ChoreoService.findById(choreo.id, user.id);
    expect(result).toBeDefined();
    expect(result.id).toBe(choreo.id);
  });

  test("findById throws for invalid id", async () => {
    await expect(
      ChoreoService.findById("invalid-id", user.id),
    ).rejects.toThrow();
  });

  test("create creates a new choreo", async () => {
    const seasonTeam = await SeasonTeam.create({});
    const result = await ChoreoService.create(
      "NewChoreo",
      10,
      "cheer",
      seasonTeam.id,
      [],
      user.id,
    );
    expect(result).toBeDefined();
    expect(result.name).toBe("NewChoreo");
    expect(result.counts).toBe(10);
    expect(result.UserId).toBe(user.id);
  });

  test("getCount returns correct number", async () => {
    await Choreo.create({
      name: "TestChoreo",
      counts: 8,
      matType: "cheer",
      UserId: user.id,
    });
    const count = await ChoreoService.getCount();
    expect(typeof count).toBe("number");
    expect(count).toBe(1);
  });

  test("getTrend returns correct trend", async () => {
    await Choreo.create({
      name: "TestChoreo",
      counts: 8,
      matType: "cheer",
      UserId: user.id,
      createdAt: new Date(),
    });
    await Choreo.create({
      name: "TestChoreo2",
      counts: 8,
      matType: "cheer",
      UserId: user.id,
      createdAt: new Date(),
    });
    const trend = await ChoreoService.getTrend();
    expect(typeof trend).toBe("number");
    expect(trend).toBe(2);
  });
});
