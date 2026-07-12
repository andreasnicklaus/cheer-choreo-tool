import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getUserFromRequest, formatError } from "./helpers";
import { type MatType } from "../db/models/choreo";
import ClubService from "../services/ClubService";
import TeamService from "../services/TeamService";
import SeasonService from "../services/SeasonService";
import SeasonTeamService from "../services/SeasonTeamService";
import MemberService from "../services/MemberService";
import ChoreoService from "../services/ChoreoService";
import HitService from "../services/HitService";
import LineupService from "../services/LineupService";
import PositionService from "../services/PositionService";
import type { AuthInfo } from "./auth";

// ─── Callback types ────────────────────────────────────────────

type ToolExtra = { authInfo?: AuthInfo };
type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolCallback = (args: any, extra: ToolExtra) => Promise<ToolResult>;

// ─── Tool definitions (schema + callback) ──────────────────────

export interface ToolDef {
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>;
  handler: ToolCallback;
}

// ─── Tool callbacks ────────────────────────────────────────────

export const toolCallbacks: Record<string, ToolDef> = {
  // Clubs (4 tools)
  list_clubs: {
    description: "List all clubs the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const clubs = await ClubService.getAll(ownerIds, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(clubs) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  get_club: {
    description:
      "Get a club by ID with all teams, season teams, choreos, and members",
    schema: { id: z.string().describe("The club UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const club = await ClubService.findById(args.id, userId, isAdmin);
        if (!club) {
          return formatError(new Error(`Club with ID ${args.id} not found`));
        }
        return { content: [{ type: "text", text: JSON.stringify(club) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_club: {
    description: "Create a new club. Seeds demo data for first club.",
    schema: { name: z.string().describe("Club name") },
    handler: async (args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const ownerId = ownerIds[0];
        const club = await ClubService.create(
          args.name,
          ownerId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(club) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_club: {
    description: "Update a club's properties (e.g. name)",
    schema: {
      id: z.string().describe("The club UUID"),
      name: z.string().optional().describe("New club name"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.name !== undefined) data.name = args.name;
        const club = await ClubService.update(args.id, data, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(club) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Teams (4 tools)
  list_teams: {
    description: "List all teams the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const teams = await TeamService.getAll(ownerIds, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(teams) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  get_team: {
    description: "Get a team by ID with season teams, members, and choreos",
    schema: { id: z.string().describe("The team UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const team = await TeamService.findById(args.id, userId, isAdmin);
        if (!team) {
          return formatError(new Error(`Team with ID ${args.id} not found`));
        }
        return { content: [{ type: "text", text: JSON.stringify(team) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_team: {
    description: "Create a new team within a club for a specific season",
    schema: {
      name: z.string().describe("Team name"),
      clubId: z.string().describe("The club UUID"),
      seasonId: z.string().describe("The season UUID"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const ownerId = ownerIds[0];
        const team = await TeamService.create(
          args.name,
          args.clubId,
          args.seasonId,
          ownerId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(team) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_team: {
    description: "Update a team's properties (e.g. name)",
    schema: {
      id: z.string().describe("The team UUID"),
      name: z.string().optional().describe("New team name"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.name !== undefined) data.name = args.name;
        const team = await TeamService.update(args.id, data, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(team) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Seasons (2 tools)
  list_seasons: {
    description: "List all seasons the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const seasons = await SeasonService.getAll(ownerIds, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(seasons) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_season: {
    description: "Create a new season (e.g. 'Summer 2026', 2026)",
    schema: {
      name: z.string().describe("Season name"),
      year: z.number().int().describe("Season year"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const ownerId = ownerIds[0];
        const season = await SeasonService.create(
          args.name,
          args.year,
          ownerId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(season) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Season Teams (2 tools)
  list_season_teams: {
    description: "List all season-team associations the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const seasonTeams = await SeasonTeamService.getAll(
          ownerIds,
          userId,
          isAdmin,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(seasonTeams) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_season_team: {
    description:
      "Create a season-team association, optionally copying members from a previous season team",
    schema: {
      teamId: z.string().describe("The team UUID"),
      seasonId: z.string().describe("The season UUID"),
      memberIds: z
        .array(z.string())
        .optional()
        .describe("Member IDs to copy into the new season team"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const seasonTeam = await SeasonTeamService.create(
          args.teamId,
          args.seasonId,
          args.memberIds ?? [],
          userId,
          isAdmin,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(seasonTeam) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Members (4 tools)
  list_members: {
    description: "List all members the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const members = await MemberService.getAll(ownerIds, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(members) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_member: {
    description: "Create a new member in a season team",
    schema: {
      name: z.string().describe("Full name"),
      nickname: z.string().describe("Nickname"),
      abbreviation: z
        .string()
        .nullable()
        .describe(
          "Abbreviation (e.g. 'AB' for Anna Berger). Pass null to auto-generate.",
        ),
      seasonTeamId: z
        .string()
        .describe("The season team UUID to add this member to"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const member = await MemberService.create(
          args.name,
          args.nickname,
          args.abbreviation,
          args.seasonTeamId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(member) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_member: {
    description:
      "Update a member's properties (e.g. name, nickname, abbreviation)",
    schema: {
      id: z.string().describe("The member UUID"),
      name: z.string().optional().describe("New full name"),
      nickname: z.string().optional().describe("New nickname"),
      abbreviation: z
        .string()
        .nullable()
        .optional()
        .describe("New abbreviation"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.name !== undefined) data.name = args.name;
        if (args.nickname !== undefined) data.nickname = args.nickname;
        if (args.abbreviation !== undefined)
          data.abbreviation = args.abbreviation;
        const member = await MemberService.update(
          args.id,
          data,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(member) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  delete_member: {
    description: "Delete a member",
    schema: { id: z.string().describe("The member UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        await MemberService.remove(args.id, userId, isAdmin);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Choreos (5 tools)
  list_choreos: {
    description: "List all choreographies the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const choreos = await ChoreoService.getAll(ownerIds, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(choreos) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  get_choreo: {
    description:
      "Get a choreography by ID with hits, lineups, positions, and participants",
    schema: { id: z.string().describe("The choreography UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const choreo = await ChoreoService.findById(args.id, userId, isAdmin);
        if (!choreo) {
          return formatError(new Error(`Choreo with ID ${args.id} not found`));
        }
        return { content: [{ type: "text", text: JSON.stringify(choreo) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_choreo: {
    description: "Create a new choreography in a season team with participants",
    schema: {
      name: z.string().describe("Choreography name"),
      counts: z
        .number()
        .int()
        .positive()
        .describe("Number of counts in the choreo"),
      seasonTeamId: z.string().describe("The season team UUID"),
      participants: z
        .array(z.object({ id: z.string(), color: z.string().optional() }))
        .describe("List of participants with member IDs"),
      matType: z
        .enum(["cheer", "square", "1:2", "3:4"])
        .optional()
        .describe("Mat type (default: cheer)"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const ownerId = ownerIds[0];
        const choreo = await ChoreoService.create(
          args.name,
          args.counts,
          args.matType as MatType,
          args.seasonTeamId,
          args.participants,
          ownerId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(choreo) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_choreo: {
    description: "Update a choreography's properties (e.g. name, counts)",
    schema: {
      id: z.string().describe("The choreography UUID"),
      name: z.string().optional().describe("New choreography name"),
      counts: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("New count number"),
      matType: z
        .enum(["cheer", "square", "1:2", "3:4"])
        .optional()
        .describe("New mat type"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.name !== undefined) data.name = args.name;
        if (args.counts !== undefined) data.counts = args.counts;
        if (args.matType !== undefined) data.matType = args.matType;
        const choreo = await ChoreoService.update(
          args.id,
          data,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(choreo) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  delete_choreo: {
    description: "Delete a choreography",
    schema: { id: z.string().describe("The choreography UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        await ChoreoService.remove(args.id, userId, isAdmin);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Hits (4 tools)
  list_hits: {
    description: "List all hits the user has access to",
    schema: {},
    handler: async (_args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const hits = await HitService.getAll(ownerIds, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(hits) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_hit: {
    description: "Create a new hit in a choreography with member associations",
    schema: {
      name: z.string().describe("Hit name"),
      count: z
        .number()
        .int()
        .min(0)
        .describe("Count number (0-based, must be < choreo.counts)"),
      choreoId: z.string().describe("The choreography UUID"),
      memberIds: z
        .array(z.string())
        .optional()
        .describe("Member UUIDs to associate"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const hit = await HitService.create(
          args.name,
          args.count,
          args.choreoId,
          args.memberIds ?? [],
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(hit) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_hit: {
    description: "Update a hit's properties and/or member associations",
    schema: {
      id: z.string().describe("The hit UUID"),
      name: z.string().optional().describe("New hit name"),
      memberIds: z
        .array(z.string())
        .optional()
        .describe("New member associations (replaces existing)"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.name !== undefined) data.name = args.name;
        if (args.memberIds !== undefined) data.memberIds = args.memberIds;
        const hit = await HitService.update(args.id, data, userId, isAdmin);
        return { content: [{ type: "text", text: JSON.stringify(hit) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  delete_hit: {
    description: "Delete a hit",
    schema: { id: z.string().describe("The hit UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        await HitService.remove(args.id, userId, isAdmin);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Lineups (4 tools)
  list_lineups: {
    description: "List lineups for a choreography",
    schema: { choreoId: z.string().describe("The choreography UUID") },
    handler: async (args, extra) => {
      try {
        getUserFromRequest(extra.authInfo);
        const lineups = await LineupService.findByChoreoId(args.choreoId);
        return { content: [{ type: "text", text: JSON.stringify(lineups) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_lineup: {
    description: "Create a new lineup for a choreography",
    schema: {
      startCount: z.number().int().min(0).describe("Start count"),
      endCount: z
        .number()
        .int()
        .min(0)
        .describe("End count (must be > startCount)"),
      choreoId: z.string().describe("The choreography UUID"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const lineup = await LineupService.create(
          args.startCount,
          args.endCount,
          args.choreoId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(lineup) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_lineup: {
    description: "Update a lineup's properties",
    schema: {
      id: z.string().describe("The lineup UUID"),
      startCount: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("New start count"),
      endCount: z.number().int().min(0).optional().describe("New end count"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.startCount !== undefined) data.startCount = args.startCount;
        if (args.endCount !== undefined) data.endCount = args.endCount;
        const lineup = await LineupService.update(
          args.id,
          data,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(lineup) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  delete_lineup: {
    description: "Delete a lineup",
    schema: { id: z.string().describe("The lineup UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        await LineupService.remove(args.id, userId, isAdmin);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },

  // Positions (4 tools)
  list_positions: {
    description: "List positions for a lineup",
    schema: { lineupId: z.string().describe("The lineup UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, ownerIds, isAdmin } = getUserFromRequest(
          extra.authInfo,
        );
        const positions = await PositionService.findByLineupId(
          args.lineupId,
          ownerIds,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(positions) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  create_position: {
    description: "Create a new position (member placement) in a lineup",
    schema: {
      x: z
        .number()
        .min(0)
        .max(100)
        .describe("X-coordinate as percentage (0=left edge, 100=right edge)"),
      y: z
        .number()
        .min(0)
        .max(100)
        .describe("Y-coordinate as percentage (0=top edge, 100=bottom edge)"),
      lineupId: z.string().describe("The lineup UUID"),
      memberId: z.string().describe("The member UUID to place"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const position = await PositionService.findOrCreate(
          args.x,
          args.y,
          args.lineupId,
          args.memberId,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(position) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  update_position: {
    description: "Update a position's coordinates or timestamp",
    schema: {
      id: z.string().describe("The position UUID"),
      x: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe("New X-coordinate as percentage (0=left, 100=right)"),
      y: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe("New Y-coordinate as percentage (0=top, 100=bottom)"),
    },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        const data: Record<string, unknown> = {};
        if (args.x !== undefined) data.x = args.x;
        if (args.y !== undefined) data.y = args.y;
        const position = await PositionService.update(
          args.id,
          null,
          data,
          userId,
          isAdmin,
        );
        return { content: [{ type: "text", text: JSON.stringify(position) }] };
      } catch (error) {
        return formatError(error);
      }
    },
  },
  delete_position: {
    description: "Delete a position",
    schema: { id: z.string().describe("The position UUID") },
    handler: async (args, extra) => {
      try {
        const { userId, isAdmin } = getUserFromRequest(extra.authInfo);
        await PositionService.remove(args.id, userId, isAdmin);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  },
};

// ─── MCP resource: agent usage guide ───────────────────────────

// ─── McpServer factory ─────────────────────────────────────────

const { version } = require("../../package.json");

function loadGuideContent(): string {
  const guideCandidates = [
    path.resolve(__dirname, "resources", "guide.md"),
    path.resolve(__dirname, "..", "..", "src", "mcp", "resources", "guide.md"),
  ];

  const guidePath = guideCandidates.find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!guidePath) {
    throw new Error("Unable to locate MCP guide resource file");
  }

  return fs.readFileSync(guidePath, "utf8");
}

const MCP_INSTRUCTIONS = `IMPORTANT: Before using any Cheer Choreo Tool, always read the usage guide resource at "guide://cheer-choreo-tool". The guide describes the data model hierarchy (Club → Team → SeasonTeam → Member/Choreo → Hit/Lineup → Position), required tool call order, parameter formats, and typical workflows. Failing to read the guide first will result in incorrect API calls — e.g. missing required IDs, wrong hierarchy order, or invalid count ranges.`;

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "cheer-choreo-tool", version },
    { instructions: MCP_INSTRUCTIONS },
  );

  for (const [name, def] of Object.entries(toolCallbacks)) {
    server.tool(name, def.description, def.schema, def.handler);
  }

  const guideContent = loadGuideContent();

  server.registerResource(
    "guide",
    "guide://cheer-choreo-tool",
    {
      description:
        "Usage guide for the Cheer Choreo Tool MCP — describes the data model, available tools, parameters, and typical workflows",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: guideContent }],
    }),
  );

  server.registerPrompt(
    "read-guide",
    {
      title: "Read Usage Guide",
      description:
        "Read the Cheer Choreo Tool usage guide covering the data model, tools, and workflows",
    },
    async () => ({
      messages: [
        { role: "assistant", content: { type: "text", text: guideContent } },
      ],
    }),
  );

  return server;
}
