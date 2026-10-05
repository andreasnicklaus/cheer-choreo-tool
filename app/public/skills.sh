#!/bin/sh
# Choreo Planer — agent skills bootstrap
#
# Prints how an agent or developer connects to Choreo Planer. Safe to pipe:
#   curl -fsSL https://www.choreo-planer.de/skills.sh | sh
#
# It performs no installation and makes no changes to your system; it only
# echoes the discovery endpoints and a ready-to-run MCP client command.

set -eu

BASE="https://www.choreo-planer.de"
API="https://api.choreo-planer.de"

cat <<EOF
Choreo Planer — agent skills

A free tool for planning cheerleading and dance choreography: clubs, teams,
seasons, members, choreographies, hits, lineups and positions, with PDF/video
countsheet export.

MCP server (Streamable HTTP):  ${API}/mcp
REST API (OpenAPI 3.1):        ${API}/openapi.json
Authentication guide:          ${API}/auth.md

Discovery documents:
  ${BASE}/llms.txt
  ${BASE}/agents.md
  ${BASE}/.well-known/mcp/server-card.json
  ${BASE}/.well-known/agent-skills/index.json
  ${BASE}/.well-known/agent-card.json
  ${BASE}/.well-known/ard.json

Connect an MCP client (example, Claude Code):
  claude mcp add --transport http choreo-planer ${API}/mcp

Write operations require a JWT bearer token — see ${API}/auth.md.
EOF
