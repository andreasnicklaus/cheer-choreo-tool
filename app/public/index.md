# Choreo Planer

Choreo Planer is a free online tool for planning cheerleading and dance
choreography. It builds countsheets, manages teams, seasons, members and
positions, and exports to PDF or video. Every feature is available at no cost.

The web application lives at <https://www.choreo-planer.de>. A public REST API is
documented at <https://api.choreo-planer.de/openapi.json>, and a Model Context
Protocol (MCP) server is available at <https://api.choreo-planer.de/mcp>.

## What you can do

- Plan choreographies ("choreos") with per-count, per-position countsheets
- Organize clubs, teams, members and positions
- Manage seasons and season-team assignments
- Build lineups and assign positions for each count
- Export countsheets as PDF or video

## Start here

- [Help and FAQ](https://www.choreo-planer.de/hilfe): How to create an account, build a countsheet, assign positions, and export.
- [Pricing](https://www.choreo-planer.de/pricing.md): The full pricing statement. The tool is free.
- [Contact](https://www.choreo-planer.de/contact): Reach the maintainers at <info@choreo-planer.de>.

## For agents and developers

- [llms.txt](https://www.choreo-planer.de/llms.txt): Navigation index for AI agents.
- [OpenAPI 3.1 specification](https://api.choreo-planer.de/openapi.json): Machine-readable description of every REST endpoint.
- [Interactive API documentation](https://api.choreo-planer.de/api-docs): Swagger UI for browsing and testing endpoints.
- [MCP server](https://api.choreo-planer.de/mcp): Model Context Protocol endpoint for agent access. Requires a JWT bearer token.
- [Authentication guide](https://api.choreo-planer.de/auth.md): How to obtain an MCP access token and send it as a bearer token.
- [MCP server card](https://www.choreo-planer.de/.well-known/mcp/server-card.json): Identity, transport and supported protocol versions for the MCP server.
- [Agent card](https://www.choreo-planer.de/.well-known/agent-card.json): A2A agent card describing capabilities and skills.
- [Agentic Resource Discovery manifest](https://www.choreo-planer.de/.well-known/ard.json): Describes the REST API and the MCP server as agentic resources.

## When to use Choreo Planer

Use Choreo Planer when you need to create or manage cheerleading or dance
choreographies as structured data: clubs, teams, seasons, members, choreos,
hits, lineups and positions, or to generate and export countsheets. Call the
REST API for scripted integrations, or connect the MCP server to let an agent
act on a user's teams and choreographies directly.

## Legal

- [Imprint](https://www.choreo-planer.de/impressum): Legal notice and operator details.
- [Privacy policy](https://www.choreo-planer.de/datenschutz): How personal data is processed.
