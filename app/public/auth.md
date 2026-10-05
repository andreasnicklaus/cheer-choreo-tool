# Authentication

Choreo Planer's MCP server and the write operations of its REST API require a
JWT bearer token. The authoritative, always-current walkthrough for obtaining
and sending a token is maintained on the API host:

**→ <https://api.choreo-planer.de/auth.md>**

In short:

1. Obtain an MCP access token via the API's login and token endpoints
   (see the guide above for the exact flow).
2. Send it on every request as `Authorization: Bearer <token>`.
3. Point your MCP client at `https://api.choreo-planer.de/mcp`
   (Streamable HTTP transport).

For REST integrations, read the OpenAPI specification at
<https://api.choreo-planer.de/openapi.json>.
