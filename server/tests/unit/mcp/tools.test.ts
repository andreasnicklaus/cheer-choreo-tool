import { describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
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

jest.mock("@/services/ClubService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: "club-1", name: "Test Club" }),
    update: jest.fn().mockResolvedValue({ id: "club-1", name: "Updated Club" }),
  },
}));

jest.mock("@/services/TeamService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: "team-1", name: "Test Team" }),
    update: jest.fn().mockResolvedValue({ id: "team-1", name: "Updated Team" }),
  },
}));

jest.mock("@/services/SeasonService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest
      .fn()
      .mockResolvedValue({ id: "season-1", name: "Summer 2026" }),
    update: jest.fn().mockResolvedValue({ id: "season-1", name: "Updated" }),
  },
}));

jest.mock("@/services/SeasonTeamService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({
      id: "st-1",
      TeamId: "team-1",
      SeasonId: "season-1",
    }),
  },
}));

jest.mock("@/services/MemberService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: "member-1", name: "Anna" }),
    update: jest
      .fn()
      .mockResolvedValue({ id: "member-1", name: "Updated Anna" }),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/services/ChoreoService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    create: jest
      .fn()
      .mockResolvedValue({ id: "choreo-1", name: "Test Choreo" }),
    update: jest.fn().mockResolvedValue({ id: "choreo-1", name: "Updated" }),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/services/HitService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: "hit-1", name: "Hit 1" }),
    mcpCreate: jest.fn().mockResolvedValue({ id: "hit-1", name: "Hit 1" }),
    bulkCreate: jest.fn().mockResolvedValue([{ id: "hit-1", name: "Hit 1" }]),
    mcpBulkCreate: jest.fn().mockResolvedValue([{ id: "hit-1", name: "Hit 1" }]),
    update: jest.fn().mockResolvedValue({ id: "hit-1", name: "Updated" }),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/services/LineupService", () => ({
  __esModule: true,
  default: {
    findByChoreoId: jest.fn().mockResolvedValue([]),
    create: jest
      .fn()
      .mockResolvedValue({ id: "lineup-1", startCount: 0, endCount: 8 }),
    update: jest
      .fn()
      .mockResolvedValue({ id: "lineup-1", startCount: 0, endCount: 16 }),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/services/PositionService", () => ({
  __esModule: true,
  default: {
    findByLineupId: jest.fn().mockResolvedValue([]),
    findOrCreate: jest.fn().mockResolvedValue({ id: "pos-1", x: 1, y: 2 }),
    mcpFindOrCreate: jest.fn().mockResolvedValue({ id: "pos-1", x: 1, y: 2 }),
    bulkFindOrCreate: jest
      .fn()
      .mockResolvedValue([{ id: "pos-1", x: 1, y: 2 }]),
    mcpBulkFindOrCreate: jest
      .fn()
      .mockResolvedValue([{ id: "pos-1", x: 1, y: 2 }]),
    update: jest.fn().mockResolvedValue({ id: "pos-1", x: 5, y: 5 }),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

import { toolCallbacks } from "@/mcp/tools";
import ClubService from "@/services/ClubService";
import TeamService from "@/services/TeamService";
import SeasonService from "@/services/SeasonService";
import SeasonTeamService from "@/services/SeasonTeamService";
import MemberService from "@/services/MemberService";
import ChoreoService from "@/services/ChoreoService";
import HitService from "@/services/HitService";
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";

function makeExtra(overrides?: {
  userId?: string;
  ownerIds?: string[];
  isAdmin?: boolean;
}) {
  return {
    authInfo: {
      token: "test-token",
      clientId: "mcp-client",
      scopes: [] as string[],
      extra: {
        userId: overrides?.userId ?? "user-123",
        ownerIds: overrides?.ownerIds ?? ["owner-1"],
        isAdmin: overrides?.isAdmin ?? false,
      },
    },
  };
}

function parseJson(result: { content: Array<{ type: string; text: string }> }) {
  return JSON.parse(result.content[0].text);
}

describe("MCP tools", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────── Clubs ────────

  describe("list_clubs", () => {
    test("calls ClubService.getAll and returns result", async () => {
      const mockClubs = [{ id: "club-1", name: "Test Club" }];
      (ClubService.getAll as jest.Mock).mockResolvedValueOnce(mockClubs);

      const result = await toolCallbacks.list_clubs.handler({}, makeExtra());

      expect(ClubService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
      expect(parseJson(result)).toEqual(mockClubs);
    });
  });

  describe("get_club", () => {
    test("calls ClubService.findById and returns result", async () => {
      const mockClub = { id: "club-1", name: "Test Club" };
      (ClubService.findById as jest.Mock).mockResolvedValueOnce(mockClub);

      const result = await toolCallbacks.get_club.handler(
        { id: "club-1" },
        makeExtra(),
      );

      expect(ClubService.findById).toHaveBeenCalledWith(
        "club-1",
        "user-123",
        false,
      );
      expect(parseJson(result)).toEqual(mockClub);
    });

    test("returns error when club not found", async () => {
      (ClubService.findById as jest.Mock).mockResolvedValueOnce(null);

      const result = await toolCallbacks.get_club.handler(
        { id: "nonexistent" },
        makeExtra(),
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("not found");
    });
  });

  describe("create_club", () => {
    test("calls ClubService.create with ownerId", async () => {
      const mockClub = { id: "club-1", name: "New Club" };
      (ClubService.create as jest.Mock).mockResolvedValueOnce(mockClub);

      const result = await toolCallbacks.create_club.handler(
        { name: "New Club" },
        makeExtra(),
      );

      expect(ClubService.create).toHaveBeenCalledWith(
        "New Club",
        "owner-1",
        "user-123",
        false,
      );
      expect(parseJson(result)).toEqual(mockClub);
    });
  });

  describe("update_club", () => {
    test("calls ClubService.update with data", async () => {
      const mockClub = { id: "club-1", name: "Updated" };
      (ClubService.update as jest.Mock).mockResolvedValueOnce(mockClub);

      const result = await toolCallbacks.update_club.handler(
        { id: "club-1", name: "Updated" },
        makeExtra(),
      );

      expect(ClubService.update).toHaveBeenCalledWith(
        "club-1",
        { name: "Updated" },
        "user-123",
        false,
      );
      expect(parseJson(result)).toEqual(mockClub);
    });
  });

  // ──────── Teams ────────

  describe("list_teams", () => {
    test("calls TeamService.getAll", async () => {
      await toolCallbacks.list_teams.handler({}, makeExtra());
      expect(TeamService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("get_team", () => {
    test("calls TeamService.findById", async () => {
      (TeamService.findById as jest.Mock).mockResolvedValueOnce({
        id: "team-1",
      });
      await toolCallbacks.get_team.handler({ id: "team-1" }, makeExtra());
      expect(TeamService.findById).toHaveBeenCalledWith(
        "team-1",
        "user-123",
        false,
      );
    });
  });

  describe("create_team", () => {
    test("calls TeamService.create with all params", async () => {
      await toolCallbacks.create_team.handler(
        { name: "New Team", clubId: "club-1", seasonId: "season-1" },
        makeExtra(),
      );
      expect(TeamService.create).toHaveBeenCalledWith(
        "New Team",
        "club-1",
        "season-1",
        "owner-1",
        "user-123",
        false,
      );
    });
  });

  describe("update_team", () => {
    test("calls TeamService.update", async () => {
      await toolCallbacks.update_team.handler(
        { id: "team-1", name: "Updated" },
        makeExtra(),
      );
      expect(TeamService.update).toHaveBeenCalledWith(
        "team-1",
        { name: "Updated" },
        "user-123",
        false,
      );
    });
  });

  // ──────── Seasons ────────

  describe("list_seasons", () => {
    test("calls SeasonService.getAll", async () => {
      await toolCallbacks.list_seasons.handler({}, makeExtra());
      expect(SeasonService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("create_season", () => {
    test("calls SeasonService.create with all params", async () => {
      await toolCallbacks.create_season.handler(
        { name: "Summer 2026", year: 2026 },
        makeExtra(),
      );
      expect(SeasonService.create).toHaveBeenCalledWith(
        "Summer 2026",
        2026,
        "owner-1",
        "user-123",
        false,
      );
    });
  });

  // ──────── Season Teams ────────

  describe("list_season_teams", () => {
    test("calls SeasonTeamService.getAll", async () => {
      await toolCallbacks.list_season_teams.handler({}, makeExtra());
      expect(SeasonTeamService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("create_season_team", () => {
    test("calls SeasonTeamService.create", async () => {
      await toolCallbacks.create_season_team.handler(
        { teamId: "team-1", seasonId: "season-1" },
        makeExtra(),
      );
      expect(SeasonTeamService.create).toHaveBeenCalledWith(
        "team-1",
        "season-1",
        [],
        "user-123",
        false,
      );
    });

    test("passes memberIds when provided", async () => {
      await toolCallbacks.create_season_team.handler(
        { teamId: "team-1", seasonId: "season-1", memberIds: ["m1", "m2"] },
        makeExtra(),
      );
      expect(SeasonTeamService.create).toHaveBeenCalledWith(
        "team-1",
        "season-1",
        ["m1", "m2"],
        "user-123",
        false,
      );
    });
  });

  // ──────── Members ────────

  describe("list_members", () => {
    test("calls MemberService.getAll", async () => {
      await toolCallbacks.list_members.handler({}, makeExtra());
      expect(MemberService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("create_member", () => {
    test("calls MemberService.create with all params", async () => {
      await toolCallbacks.create_member.handler(
        {
          name: "Anna",
          nickname: "A",
          abbreviation: "AB",
          seasonTeamId: "st-1",
        },
        makeExtra(),
      );
      expect(MemberService.create).toHaveBeenCalledWith(
        "Anna",
        "A",
        "AB",
        "st-1",
        "user-123",
        false,
      );
    });
  });

  describe("update_member", () => {
    test("calls MemberService.update with changed fields", async () => {
      await toolCallbacks.update_member.handler(
        { id: "member-1", name: "New Anna" },
        makeExtra(),
      );
      expect(MemberService.update).toHaveBeenCalledWith(
        "member-1",
        { name: "New Anna" },
        "user-123",
        false,
      );
    });
  });

  describe("delete_member", () => {
    test("calls MemberService.remove", async () => {
      await toolCallbacks.delete_member.handler(
        { id: "member-1" },
        makeExtra(),
      );
      expect(MemberService.remove).toHaveBeenCalledWith(
        "member-1",
        "user-123",
        false,
      );
    });
  });

  // ──────── Choreos ────────

  describe("list_choreos", () => {
    test("calls ChoreoService.getAll", async () => {
      await toolCallbacks.list_choreos.handler({}, makeExtra());
      expect(ChoreoService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("get_choreo", () => {
    test("calls ChoreoService.findById", async () => {
      (ChoreoService.findById as jest.Mock).mockResolvedValueOnce({
        id: "choreo-1",
      });
      await toolCallbacks.get_choreo.handler({ id: "choreo-1" }, makeExtra());
      expect(ChoreoService.findById).toHaveBeenCalledWith(
        "choreo-1",
        "user-123",
        false,
      );
    });
  });

  describe("create_choreo", () => {
    test("calls ChoreoService.create with all params", async () => {
      await toolCallbacks.create_choreo.handler(
        {
          name: "New Choreo",
          counts: 32,
          seasonTeamId: "st-1",
          participants: [{ id: "m1" }],
          matType: "cheer",
        },
        makeExtra(),
      );
      expect(ChoreoService.create).toHaveBeenCalledWith(
        "New Choreo",
        32,
        "cheer",
        "st-1",
        [{ id: "m1" }],
        "owner-1",
        "user-123",
        false,
      );
    });
  });

  describe("update_choreo", () => {
    test("calls ChoreoService.update with changed fields", async () => {
      await toolCallbacks.update_choreo.handler(
        { id: "choreo-1", name: "Updated" },
        makeExtra(),
      );
      expect(ChoreoService.update).toHaveBeenCalledWith(
        "choreo-1",
        { name: "Updated" },
        "user-123",
        false,
      );
    });
  });

  describe("delete_choreo", () => {
    test("calls ChoreoService.remove", async () => {
      await toolCallbacks.delete_choreo.handler(
        { id: "choreo-1" },
        makeExtra(),
      );
      expect(ChoreoService.remove).toHaveBeenCalledWith(
        "choreo-1",
        "user-123",
        false,
      );
    });
  });

  // ──────── Hits ────────

  describe("list_hits", () => {
    test("calls HitService.getAll", async () => {
      await toolCallbacks.list_hits.handler({}, makeExtra());
      expect(HitService.getAll).toHaveBeenCalledWith(
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("create_hit", () => {
    test("calls HitService.mcpCreate with all params", async () => {
      await toolCallbacks.create_hit.handler(
        { name: "Hit 1", count: 0, choreoId: "choreo-1", memberIds: ["m1"] },
        makeExtra(),
      );
      expect(HitService.mcpCreate).toHaveBeenCalledWith(
        "Hit 1",
        0,
        "choreo-1",
        ["m1"],
        "user-123",
        false,
      );
    });

    test("defaults memberIds to empty array", async () => {
      await toolCallbacks.create_hit.handler(
        { name: "Hit 1", count: 0, choreoId: "choreo-1" },
        makeExtra(),
      );
      expect(HitService.mcpCreate).toHaveBeenCalledWith(
        "Hit 1",
        0,
        "choreo-1",
        [],
        "user-123",
        false,
      );
    });
  });

  describe("create_hits", () => {
    test("calls HitService.mcpBulkCreate with all params", async () => {
      await toolCallbacks.create_hits.handler(
        {
          choreoId: "choreo-1",
          hits: [
            { name: "Hit 1", count: 0, memberIds: ["m1"] },
            { name: "Hit 2", count: 4 },
          ],
        },
        makeExtra(),
      );
      expect(HitService.mcpBulkCreate).toHaveBeenCalledWith(
        [
          { name: "Hit 1", count: 0, memberIds: ["m1"] },
          { name: "Hit 2", count: 4 },
        ],
        "choreo-1",
        "user-123",
        false,
      );
    });
  });

  describe("update_hit", () => {
    test("calls HitService.update with changed fields", async () => {
      await toolCallbacks.update_hit.handler(
        { id: "hit-1", name: "Updated Hit" },
        makeExtra(),
      );
      expect(HitService.update).toHaveBeenCalledWith(
        "hit-1",
        { name: "Updated Hit" },
        "user-123",
        false,
      );
    });

    test("includes memberIds when provided", async () => {
      await toolCallbacks.update_hit.handler(
        { id: "hit-1", memberIds: ["m1", "m2"] },
        makeExtra(),
      );
      expect(HitService.update).toHaveBeenCalledWith(
        "hit-1",
        { memberIds: ["m1", "m2"] },
        "user-123",
        false,
      );
    });
  });

  describe("delete_hit", () => {
    test("calls HitService.remove", async () => {
      await toolCallbacks.delete_hit.handler({ id: "hit-1" }, makeExtra());
      expect(HitService.remove).toHaveBeenCalledWith(
        "hit-1",
        "user-123",
        false,
      );
    });
  });

  // ──────── Lineups ────────

  describe("list_lineups", () => {
    test("calls LineupService.findByChoreoId", async () => {
      await toolCallbacks.list_lineups.handler(
        { choreoId: "choreo-1" },
        makeExtra(),
      );
      expect(LineupService.findByChoreoId).toHaveBeenCalledWith("choreo-1");
    });
  });

  describe("create_lineup", () => {
    test("calls LineupService.create", async () => {
      await toolCallbacks.create_lineup.handler(
        { startCount: 0, endCount: 8, choreoId: "choreo-1" },
        makeExtra(),
      );
      expect(LineupService.create).toHaveBeenCalledWith(
        0,
        8,
        "choreo-1",
        "user-123",
        false,
      );
    });
  });

  describe("update_lineup", () => {
    test("calls LineupService.update with changed fields", async () => {
      await toolCallbacks.update_lineup.handler(
        { id: "lineup-1", endCount: 16 },
        makeExtra(),
      );
      expect(LineupService.update).toHaveBeenCalledWith(
        "lineup-1",
        { endCount: 16 },
        "user-123",
        false,
      );
    });
  });

  describe("delete_lineup", () => {
    test("calls LineupService.remove", async () => {
      await toolCallbacks.delete_lineup.handler(
        { id: "lineup-1" },
        makeExtra(),
      );
      expect(LineupService.remove).toHaveBeenCalledWith(
        "lineup-1",
        "user-123",
        false,
      );
    });
  });

  // ──────── Positions ────────

  describe("list_positions", () => {
    test("calls PositionService.findByLineupId", async () => {
      await toolCallbacks.list_positions.handler(
        { lineupId: "lineup-1" },
        makeExtra(),
      );
      expect(PositionService.findByLineupId).toHaveBeenCalledWith(
        "lineup-1",
        ["owner-1"],
        "user-123",
        false,
      );
    });
  });

  describe("create_position", () => {
    test("calls PositionService.mcpFindOrCreate with all params", async () => {
      await toolCallbacks.create_position.handler(
        { x: 1, y: 2, lineupId: "lineup-1", memberId: "m1" },
        makeExtra(),
      );
      expect(PositionService.mcpFindOrCreate).toHaveBeenCalledWith(
        1,
        2,
        "lineup-1",
        "m1",
        "user-123",
        false,
      );
    });
  });

  describe("create_positions", () => {
    test("calls PositionService.mcpBulkFindOrCreate with all params", async () => {
      await toolCallbacks.create_positions.handler(
        {
          lineupId: "lineup-1",
          positions: [
            { x: 1, y: 2, memberId: "m1" },
            { x: 3, y: 4, memberId: "m2" },
          ],
        },
        makeExtra(),
      );
      expect(PositionService.mcpBulkFindOrCreate).toHaveBeenCalledWith(
        [
          { x: 1, y: 2, memberId: "m1" },
          { x: 3, y: 4, memberId: "m2" },
        ],
        "lineup-1",
        "user-123",
        false,
      );
    });
  });

  describe("update_position", () => {
    test("calls PositionService.update with coordinates", async () => {
      await toolCallbacks.update_position.handler(
        { id: "pos-1", x: 5, y: 5 },
        makeExtra(),
      );
      expect(PositionService.update).toHaveBeenCalledWith(
        "pos-1",
        null,
        { x: 5, y: 5 },
        "user-123",
        false,
      );
    });
  });

  describe("delete_position", () => {
    test("calls PositionService.remove", async () => {
      await toolCallbacks.delete_position.handler({ id: "pos-1" }, makeExtra());
      expect(PositionService.remove).toHaveBeenCalledWith(
        "pos-1",
        "user-123",
        false,
      );
    });
  });
});
