import { Response, Router } from "express";
import { SUPPORTED_PROTOCOL_VERSIONS } from "@modelcontextprotocol/sdk/types.js";

const { version } = require("../../package.json");

const BASE_URL = (
  process.env.BACKEND_DOMAIN || "https://api.choreo-planer.de"
).replace(/\/+$/, "");

const MCP_RESOURCE_URL = `${BASE_URL}/mcp`;
const SERVER_CARD_URL = `${BASE_URL}/mcp/server-card`;
const AUTH_DOC_URL = `${BASE_URL}/auth.md`;
const RESOURCE_METADATA_URL = `${BASE_URL}/.well-known/oauth-protected-resource`;

const SERVER_CARD_SCHEMA =
  "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json";

const SERVER_CARD_MEDIA_TYPE = "application/mcp-server-card+json";
const AI_CATALOG_MEDIA_TYPE = "application/ai-catalog+json";

const MCP_IDENTIFIER = "urn:air:choreo-planer.de:mcp:cheer-choreo-tool";

const DESCRIPTION =
  "Create and manage cheerleading choreographies as structured data: clubs, teams, seasons, members, choreos, hits, lineups and positions.";

function buildServerCard() {
  return {
    $schema: SERVER_CARD_SCHEMA,
    name: "de.choreo-planer/cheer-choreo-tool",
    version,
    title: "Choreo Planer MCP Server",
    description: DESCRIPTION,
    websiteUrl: "https://www.choreo-planer.de",
    repository: {
      url: "https://github.com/andreasnicklaus/cheer-choreo-tool",
      source: "github",
      subfolder: "server",
    },
    remotes: [
      {
        type: "streamable-http",
        url: MCP_RESOURCE_URL,
        supportedProtocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
      },
    ],
  };
}

function buildAiCatalog() {
  return {
    specVersion: "1.0",
    entries: [
      {
        identifier: MCP_IDENTIFIER,
        type: SERVER_CARD_MEDIA_TYPE,
        url: SERVER_CARD_URL,
      },
    ],
  };
}

/**
 * RFC 9728 protected resource metadata.
 *
 * `authorization_servers` is intentionally omitted: Choreo Planer issues MCP
 * access tokens through its own `POST /auth/mcp-token` endpoint and does not
 * operate an OAuth 2.0 authorization server. RFC 9728 marks the parameter
 * OPTIONAL for exactly this case.
 */
function buildProtectedResourceMetadata() {
  return {
    resource: MCP_RESOURCE_URL,
    bearer_methods_supported: ["header"],
    resource_name: "Choreo Planer MCP Server",
    resource_documentation: AUTH_DOC_URL,
  };
}

function sendPublicJson(res: Response, body: unknown, mediaType: string) {
  res.setHeader("Content-Type", mediaType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.status(200).json(body);
}

const router = Router();

const sendServerCard = (_req: unknown, res: Response) =>
  sendPublicJson(res, buildServerCard(), SERVER_CARD_MEDIA_TYPE);

const sendAiCatalog = (_req: unknown, res: Response) =>
  sendPublicJson(res, buildAiCatalog(), AI_CATALOG_MEDIA_TYPE);

const sendProtectedResourceMetadata = (_req: unknown, res: Response) =>
  sendPublicJson(res, buildProtectedResourceMetadata(), "application/json");

// Reserved single-server location (SEP-2127) plus widely used aliases.
router.get("/server-card", sendServerCard);
router.get("/mcp/server-card", sendServerCard);
router.get("/mcp-server-card.json", sendServerCard);

// Domain-level discovery entrypoints.
router.get("/.well-known/ai-catalog.json", sendAiCatalog);
router.get("/.well-known/mcp", sendAiCatalog);

// RFC 9728. The path-aware variant is the location derived from the
// resource identifier, per RFC 9728 section 3.1.
router.get(
  "/.well-known/oauth-protected-resource",
  sendProtectedResourceMetadata,
);
router.get(
  "/.well-known/oauth-protected-resource/mcp",
  sendProtectedResourceMetadata,
);

router.get("/auth.md", (_req: unknown, res: Response) => {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.sendFile("auth.md", { root: `${__dirname}/resources` });
});

export { RESOURCE_METADATA_URL, SERVER_CARD_URL, router as mcpDiscoveryRouter };
