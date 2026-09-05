import { Router } from "express";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import logger from "@/plugins/winston";
import { JwtTokenVerifier } from "./auth";
import { createMcpServer } from "./tools";

const verifier = new JwtTokenVerifier();

const router = Router();

router.use(requireBearerAuth({ verifier }));

const transports: Record<string, StreamableHTTPServerTransport> = {};

router.post("/", async (req, res) => {
  logger.debug(
    `[MCP] POST received — content-type: ${req.headers["content-type"]}, session-id: ${req.headers["mcp-session-id"] ?? "(none)"}, body: ${JSON.stringify(req.body)}`,
  );
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const existingTransport = sessionId ? transports[sessionId] : undefined;
  const method = req.body?.method ?? "(unknown)";

  if (existingTransport) {
    logger.debug(
      `[MCP] ${method} — existing session ${existingTransport.sessionId}`,
    );
    await existingTransport.handleRequest(req, res, req.body);
    return;
  }

  logger.debug(`[MCP] ${method} — new session`);

  const mcpServer = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (sessionId) => {
      logger.debug(`[MCP] session initialized: ${sessionId}`);
      transports[sessionId] = transport;
    },
    onsessionclosed: (sessionId) => {
      logger.debug(`[MCP] session closed: ${sessionId}`);
      delete transports[sessionId];
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      delete transports[transport.sessionId];
    }
  };

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

router.get("/", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const transport = sessionId ? transports[sessionId] : undefined;

  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await transport.handleRequest(req, res);
});

router.delete("/", async (req, res) => {
  logger.debug(
    `[MCP] DELETE received — content-type: ${req.headers["content-type"]}, session-id: ${req.headers["mcp-session-id"] ?? "(none)"}, body: ${JSON.stringify(req.body)}`,
  );
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const transport = sessionId ? transports[sessionId] : undefined;

  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await transport.handleRequest(req, res);
});

export { router as mcpRouter };
