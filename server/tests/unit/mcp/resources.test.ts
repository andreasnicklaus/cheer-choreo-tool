import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";

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
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock("@/services/TeamService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock("@/services/SeasonService", () => ({
  __esModule: true,
  default: { getAll: jest.fn().mockResolvedValue([]), create: jest.fn() },
}));
jest.mock("@/services/SeasonTeamService", () => ({
  __esModule: true,
  default: { getAll: jest.fn().mockResolvedValue([]), create: jest.fn() },
}));
jest.mock("@/services/MemberService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock("@/services/ChoreoService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock("@/services/HitService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock("@/services/LineupService", () => ({
  __esModule: true,
  default: {
    findByChoreoId: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock("@/services/PositionService", () => ({
  __esModule: true,
  default: {
    findByLineupId: jest.fn().mockResolvedValue([]),
    findOrCreate: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "@/mcp/tools";

describe("MCP guide resources", () => {
  let client: Client;
  let server: ReturnType<typeof createMcpServer>;

  beforeAll(async () => {
    server = createMcpServer();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  test("server provides instructions referencing all three resources", () => {
    const instructions = client.getInstructions();
    expect(instructions).toBeDefined();
    expect(instructions).toContain("guide://cheer-choreo-tool/guide");
    expect(instructions).toContain("guide://cheer-choreo-tool/hits");
    expect(instructions).toContain("guide://cheer-choreo-tool/lineups");
    expect(instructions).toContain("data model hierarchy");
  });

  test("lists three guide resources", async () => {
    const { resources } = await client.listResources();
    expect(resources).toHaveLength(3);

    const names = resources.map((r) => r.name).sort();
    expect(names).toEqual(["guide", "hits", "lineups"]);

    for (const resource of resources) {
      expect(resource.mimeType).toBe("text/markdown");
    }
  });

  test("guide resource contains data model and tools sections", async () => {
    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool/guide",
    });
    expect(result.contents).toHaveLength(1);

    const content = result.contents[0] as { uri: string; text: string };
    expect(content.text).toContain("# Cheer Choreo Tool — MCP Usage Guide");
    expect(content.text).toContain("## Data Model");
    expect(content.text).toContain("## Tools");
    expect(content.text).toContain("## Typical Workflow");
    expect(content.text).toContain("## Auth");
    expect(content.text).toContain("list_clubs");
    expect(content.text).toContain("create_choreo");
    expect(content.text).toContain("create_position");
  });

  test("hits resource contains naming conventions", async () => {
    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool/hits",
    });
    expect(result.contents).toHaveLength(1);

    const content = result.contents[0] as { text: string };
    expect(content.text).toContain("# Hits Guide");
    expect(content.text).toContain("CRITICAL: How Hit Names Are Built");
    expect(content.text).toContain("Pre-Directions");
    expect(content.text).toContain("Pre-Actions");
    expect(content.text).toContain("## Valid Examples");
  });

  test("lineups resource contains formation rules and position tables", async () => {
    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool/lineups",
    });
    expect(result.contents).toHaveLength(1);

    const content = result.contents[0] as { text: string };
    expect(content.text).toContain("# Lineups Guide");
    expect(content.text).toContain("## Lineup Rules");
    expect(content.text).toContain(
      "Position Combinations by Participant Count",
    );
    expect(content.text).toContain("## Best Practices");
  });

  test("guide resource content matches its source file", async () => {
    const guidePath = path.resolve(
      __dirname,
      "../../../src/mcp/resources/guide.md",
    );
    const guideFile = fs.readFileSync(guidePath, "utf8");

    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool/guide",
    });
    const content = result.contents[0] as { text: string };

    expect(content.text).toBe(guideFile);
  });

  test("hits resource content matches its source file", async () => {
    const hitsPath = path.resolve(
      __dirname,
      "../../../src/mcp/resources/hits.md",
    );
    const hitsFile = fs.readFileSync(hitsPath, "utf8");

    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool/hits",
    });
    const content = result.contents[0] as { text: string };

    expect(content.text).toBe(hitsFile);
  });

  test("lineups resource content matches its source file", async () => {
    const lineupsPath = path.resolve(
      __dirname,
      "../../../src/mcp/resources/lineups.md",
    );
    const lineupsFile = fs.readFileSync(lineupsPath, "utf8");

    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool/lineups",
    });
    const content = result.contents[0] as { text: string };

    expect(content.text).toBe(lineupsFile);
  });

  test("lists the read-guide prompt", async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts).toHaveLength(1);
    expect(prompts[0].name).toBe("read-guide");
    expect(prompts[0].description).toContain("usage guide");
  });

  test("getPrompt returns all guide content as messages", async () => {
    const result = await client.getPrompt({ name: "read-guide" });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe("assistant");

    const content = result.messages[0].content as {
      type: string;
      text: string;
    };
    expect(content.type).toBe("text");
    expect(content.text).toContain("# Cheer Choreo Tool — MCP Usage Guide");
    expect(content.text).toContain("## Data Model");
    expect(content.text).toContain("# Hits Guide");
    expect(content.text).toContain("# Lineups Guide");
  });
});
