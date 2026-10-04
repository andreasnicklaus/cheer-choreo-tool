# Authentication

Choreo Planer uses **bearer tokens** (JWT, per RFC 6750). There is no OAuth 2.0
authorization server and no API key system.

Access is always scoped to an existing Choreo Planer account. A token grants
nothing beyond what its owner can already see and edit in the web app.

## Endpoints

| Purpose                          | Endpoint                       |
| :------------------------------- | :----------------------------- |
| Exchange credentials for a token | `POST /auth/login`             |
| Mint an MCP access token         | `POST /auth/mcp-token`         |
| MCP endpoint                     | `POST` / `GET` / `DELETE /mcp` |
| OpenAPI specification            | `GET /openapi.json`            |
| Interactive API docs             | `GET /api-docs`                |

Base URL: `https://api.choreo-planer.de`

## Step 1 — Log in

```http
POST /auth/login
Content-Type: application/json

{ "username": "you@example.com", "password": "your-password" }
```

`username` accepts either the account username or the e-mail address.

The response body is the **raw JWT as a plain string**, not a JSON object:

```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Step 2 — Mint an MCP token

```http
POST /auth/mcp-token
Authorization: Bearer <token-from-step-1>
Content-Type: application/json

{ "expiresIn": "30d" }
```

`expiresIn` is optional and defaults to `30d`. It accepts any value the
`jsonwebtoken` library understands, such as `"1h"`, `"7d"` or `"30d"`.

The response is a JSON object:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Requests to `/auth/mcp-token` must themselves carry a valid token from step 1,
so this step cannot be performed anonymously.

## Step 3 — Call the MCP server

```http
POST /mcp
Authorization: Bearer <token-from-step-2>
Content-Type: application/json
Accept: application/json, text/event-stream
```

`POST` initialises a session and returns an `mcp-session-id` header. Reuse that
value on subsequent `GET` and `DELETE` requests to the same endpoint.

## Unauthenticated responses

Requests without a valid token receive `401 Unauthorized` together with a
challenge that points at the protected resource metadata:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://api.choreo-planer.de/.well-known/oauth-protected-resource"
```

That document is an [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html)
protected resource metadata description. It deliberately omits
`authorization_servers`, because tokens are issued by `/auth/mcp-token` rather
than by an OAuth authorization server.

## Token handling

- Send tokens only over HTTPS.
- Treat a token as a password. It is a bearer credential: possession is sufficient.
- Do not log tokens. If a token is exposed, log in again and discard it.
- Tokens are not refreshable. When one expires, repeat steps 1 and 2.

## Discovery

| Document                    | URL                                                                 |
| :-------------------------- | :------------------------------------------------------------------ |
| Server card                 | `https://api.choreo-planer.de/mcp/server-card`                      |
| MCP catalog                 | `https://api.choreo-planer.de/.well-known/ai-catalog.json`          |
| Protected resource metadata | `https://api.choreo-planer.de/.well-known/oauth-protected-resource` |

## Errors

| Status | Meaning                                           |
| :----- | :------------------------------------------------ |
| `401`  | Missing, malformed or expired token               |
| `403`  | Token valid, but the action is not permitted      |
| `404`  | Not found, or the owning account no longer exists |
