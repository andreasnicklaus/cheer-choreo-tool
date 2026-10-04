import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import logger from "@/plugins/winston";
import { JwtTokenVerifier } from "./auth";
import { RESOURCE_METADATA_URL } from "./discovery";
import { createMcpServer } from "./tools";

const verifier = new JwtTokenVerifier();

const router = Router();

/**
 * JSON-RPC methods that an agent may call before authenticating.
 *
 * The capability handshake (`initialize`, `tools/list`, `ping`) is left public
 * so scanners and agents can discover the server's WebMCP capabilities and
 * enumerate tools without a bearer token. Everything else — notably
 * `tools/call` and all `resources/*` and `prompts/*` reads — stays behind
 * `requireBearerAuth`, which answers with a 401 and the RFC 9728
 * `WWW-Authenticate` pointer to the protected-resource metadata.
 */
const PUBLIC_MCP_METHODS = new Set([
  "initialize",
  "notifications/initialized",
  "tools/list",
  "ping",
]);

const bearerAuth = requireBearerAuth({
  verifier,
  resourceMetadataUrl: RESOURCE_METADATA_URL,
});

/**
 * Enforce bearer auth only for methods not in {@link PUBLIC_MCP_METHODS}.
 *
 * GET (stream resume) and DELETE (session teardown) always require a prior
 * authenticated session, so they stay gated. For POST we inspect the JSON-RPC
 * method and skip auth for the public capability handshake.
 */
const conditionalBearerAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.method === "POST") {
    const method = req.body?.method;
    if (typeof method === "string" && PUBLIC_MCP_METHODS.has(method)) {
      next();
      return;
    }
  }
  bearerAuth(req, res, next);
};

router.use(conditionalBearerAuth);

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
