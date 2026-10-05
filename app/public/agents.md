# Choreo Planer — Agent Guide (agents.md)

Choreo Planer is a free online tool for planning cheerleading and dance
choreography. It builds countsheets and manages clubs, teams, seasons, members,
choreographies, hits, lineups and positions, and exports to PDF or video. Every
feature is free.

- Web app: <https://www.choreo-planer.de>
- REST API (OpenAPI 3.1): <https://api.choreo-planer.de/openapi.json>
- MCP server (Streamable HTTP): <https://api.choreo-planer.de/mcp>

## When to use this

Reach for Choreo Planer when a task involves cheerleading or dance choreography
as structured data. It is a good fit when you need to:

- create or edit a choreography ("choreo") and its countsheet
- manage clubs, teams, seasons, members, positions and lineups
- assign positions and counts to a lineup
- export a countsheet as PDF or video

It is not a general calendar, CRM or video editor; it is purpose-built for
choreography sport. If the user's request is not about choreography, teams,
members, lineups or countsheets, this tool is probably not the right fit.

## How to call it

- **MCP server** — preferred for agent frameworks that speak the Model Context
  Protocol. Endpoint: <https://api.choreo-planer.de/mcp> (Streamable HTTP). It
  exposes the choreo, team, club, member, position, lineup, season and
  season-team services as tools. Before creating data, read the MCP resources
  `guide://cheer-choreo-tool/guide`, `.../hits` and `.../lineups`.
- **REST API** — the primary programmatic surface for scripted integrations.
  Machine-readable spec at <https://api.choreo-planer.de/openapi.json>, browsable
  at <https://api.choreo-planer.de/api-docs>. Base URL: `https://api.choreo-planer.de`.

## Authentication

Write operations on the REST API and all MCP tool calls require a JWT bearer
token. The full walkthrough for obtaining and sending a token is at
<https://api.choreo-planer.de/auth.md>. Send it as
`Authorization: Bearer <token>`.

## Discovery documents

- [llms.txt](https://www.choreo-planer.de/llms.txt): navigation index
- [llms-full.txt](https://www.choreo-planer.de/llms-full.txt): full agent guide
- [index.md](https://www.choreo-planer.de/index.md): markdown homepage
- [agent-card.json](https://www.choreo-planer.de/.well-known/agent-card.json): A2A agent card
- [agent-skills index](https://www.choreo-planer.de/.well-known/agent-skills/index.json): skills catalog
- [MCP server card](https://www.choreo-planer.de/.well-known/mcp/server-card.json): MCP identity and transport
- [ard.json](https://www.choreo-planer.de/.well-known/ard.json): Agentic Resource Discovery manifest
- [ai-catalog.json](https://www.choreo-planer.de/.well-known/ai-catalog.json): AI Catalog discovery alias
- [ai-plugin.json](https://www.choreo-planer.de/.well-known/ai-plugin.json): ChatGPT / plugin manifest
- [api-catalog](https://www.choreo-planer.de/.well-known/api-catalog): RFC 9727 API catalog

## Contact

Questions: <info@choreo-planer.de>. The tool is free; there is no paid tier.
