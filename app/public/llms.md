# Choreo Planer — Agent Guide

Choreo Planer is a free online tool for planning cheerleading and dance
choreography. This page tells AI agents and automated clients how to work with
it. For the human site, see <https://www.choreo-planer.de>.

## When to use this

Reach for Choreo Planer when a task involves cheerleading or dance choreography
as structured data. It is a good fit when you need to:

- create or edit a choreography ("choreo") and its countsheet
- manage clubs, teams, seasons, members, positions and lineups
- assign positions and counts to a lineup
- export a countsheet as PDF or video

It is not a general calendar, CRM or video editor; it is purpose-built for
choreography sport.

## How to call it

- **REST API** — the primary programmatic surface. Read the machine-readable
  spec at <https://api.choreo-planer.de/openapi.json> and browse it at
  <https://api.choreo-planer.de/api-docs>. Base URL: `https://api.choreo-planer.de`.
- **MCP server** — for agent frameworks that speak the Model Context Protocol.
  Endpoint: <https://api.choreo-planer.de/mcp> (Streamable HTTP). It exposes the
  choreo, team, club, member, position, lineup, season and season-team services
  as tools.

## Authentication

Both the REST API's write operations and the MCP server require a JWT bearer
token. The full walkthrough for obtaining and sending a token is at
<https://api.choreo-planer.de/auth.md>. Send it as `Authorization: Bearer <token>`.

## Discovery documents

- [llms.txt](https://www.choreo-planer.de/llms.txt): navigation index
- [index.md](https://www.choreo-planer.de/index.md): markdown homepage
- [agent-card.json](https://www.choreo-planer.de/.well-known/agent-card.json): A2A agent card
- [agent-skills index](https://www.choreo-planer.de/.well-known/agent-skills/index.json): skills catalog
- [MCP server card](https://www.choreo-planer.de/.well-known/mcp/server-card.json): MCP identity and transport
- [ard.json](https://www.choreo-planer.de/.well-known/ard.json): Agentic Resource Discovery manifest
- [api-catalog](https://www.choreo-planer.de/.well-known/api-catalog): RFC 9727 API catalog

## Contact

Questions: <info@choreo-planer.de>. The tool is free; there is no paid tier.
