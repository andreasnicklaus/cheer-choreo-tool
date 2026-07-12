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

describe("MCP guide resource", () => {
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

  test("server provides instructions to guide agents", () => {
    const instructions = client.getInstructions();
    expect(instructions).toBeDefined();
    expect(instructions).toContain("read the usage guide resource");
    expect(instructions).toContain("guide://cheer-choreo-tool");
    expect(instructions).toContain("data model hierarchy");
  });

  test("lists the guide resource", async () => {
    const { resources } = await client.listResources();
    expect(resources).toHaveLength(1);
    expect(resources[0].name).toBe("guide");
    expect(resources[0].uri).toBe("guide://cheer-choreo-tool");
    expect(resources[0].mimeType).toBe("text/markdown");
  });

  test("readResource returns guide content with expected sections", async () => {
    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool",
    });
    expect(result.contents).toHaveLength(1);

    const content = result.contents[0] as { uri: string; text: string };
    expect(content.text).toBeDefined();
    const text = content.text;
    expect(text).toContain("# Cheer Choreo Tool — MCP Usage Guide");
    expect(text).toContain("## Data Model");
    expect(text).toContain("## Tools");
    expect(text).toContain("## Typical Workflow");
    expect(text).toContain("## Auth");
    expect(text).toContain("list_clubs");
    expect(text).toContain("create_choreo");
    expect(text).toContain("create_position");
  });

  test("guide content is loaded from the resources directory", async () => {
    const guidePath = path.resolve(
      __dirname,
      "../../../src/mcp/resources/guide.md",
    );
    const guideFile = fs.readFileSync(guidePath, "utf8");

    const result = await client.readResource({
      uri: "guide://cheer-choreo-tool",
    });
    const content = result.contents[0] as { text: string };

    expect(content.text).toBe(guideFile);
  });

  test("lists the read-guide prompt", async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts).toHaveLength(1);
    expect(prompts[0].name).toBe("read-guide");
    expect(prompts[0].description).toContain("usage guide");
  });

  test("getPrompt returns guide content as messages", async () => {
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
    expect(content.text).toContain("## Typical Workflow");
  });
});
