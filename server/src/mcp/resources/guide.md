# Cheer Choreo Tool — MCP Usage Guide

## Overview

This MCP server provides access to the Cheer Choreo Tool, a choreography planning application for cheerleading teams. It exposes tools for managing clubs, teams, seasons, members, choreographies, hits, lineups, and positions.

## Data Model

The entities form a hierarchy:

Club
└─ Team
└─ SeasonTeam (links a Team to a Season)
├─ Member
└─ Choreo
├─ Hit
└─ Lineup
└─ Position (member placement on the mat)

- A **Club** owns Teams and Members (via SeasonTeam).
- A **Team** belongs to one Club and can appear in multiple Seasons.
- A **SeasonTeam** is the intersection of a Team and a Season; it holds Members.
- A **Choreo** belongs to a SeasonTeam and references Member IDs as participants.
- A **Hit** marks a named count in a Choreo, optionally linked to Member IDs.
- A **Lineup** covers a count range within a Choreo.
- A **Position** places a single Member at (x, y) coordinates inside a Lineup.

## Mat Types

Mat types define the performance area shape. Valid values: `cheer`, `square`, `1:2`, `3:4`.
Default is `cheer` when not specified.

## Auth

Every request requires a JWT Bearer token in the Authorization header.
The token identifies the user and determines which data they can access.

- **Access control:** Users can only see and modify data they own or have been granted access to.
- **Admin users:** Bypass ownership checks and can access all data.
- **First-class entities** (Club, Team, Season, SeasonTeam) cannot be deleted.
- **Child entities** (Member, Choreo, Hit, Lineup, Position) can be deleted.

## Tools

### Clubs

| Tool        | Description                                    | Required params |
| ----------- | ---------------------------------------------- | --------------- |
| list_clubs  | List all accessible clubs                      | —               |
| get_club    | Get a club with teams, members, choreos        | id              |
| create_club | Create a club (seeds demo data for first club) | name            |
| update_club | Update a club (e.g. rename)                    | id, [name]      |

### Teams

| Tool        | Description                                    | Required params        |
| ----------- | ---------------------------------------------- | ---------------------- |
| list_teams  | List all accessible teams                      | —                      |
| get_team    | Get a team with season teams, members, choreos | id                     |
| create_team | Create a team in a club for a season           | name, clubId, seasonId |
| update_team | Update a team (e.g. rename)                    | id, [name]             |

### Seasons

| Tool          | Description                          | Required params |
| ------------- | ------------------------------------ | --------------- |
| list_seasons  | List all accessible seasons          | —               |
| create_season | Create a season (e.g. "Summer 2026") | name, year      |

### Season Teams

| Tool               | Description                                        | Required params               |
| ------------------ | -------------------------------------------------- | ----------------------------- |
| list_season_teams  | List all season-team associations                  | —                             |
| create_season_team | Create a season-team link, optionally copy members | teamId, seasonId, [memberIds] |

### Members

| Tool          | Description                   | Required params                            |
| ------------- | ----------------------------- | ------------------------------------------ |
| list_members  | List all accessible members   | —                                          |
| create_member | Add a member to a season team | name, nickname, abbreviation, seasonTeamId |
| update_member | Update member info            | id, [name, nickname, abbreviation]         |
| delete_member | Remove a member               | id                                         |

**Member abbreviations:** Used for short display (e.g. "AB" for Anna Berger).
Pass `null` for abbreviation to auto-generate from the member's name.

### Choreographies

| Tool          | Description                                  | Required params                          |
| ------------- | -------------------------------------------- | ---------------------------------------- |
| list_choreos  | List all accessible choreographies           | —                                        |
| get_choreo    | Get a choreo with hits, lineups, positions   | id                                       |
| create_choreo | Create a choreo with participants            | name, counts, seasonTeamId, participants |
| update_choreo | Update a choreo (e.g. name, counts, matType) | id, [name, counts, matType]              |
| delete_choreo | Delete a choreography                        | id                                       |

**Participants format:** Array of `{ id: string, color?: string }` objects.
The `id` is the member UUID; `color` is optional for visual identification.

### Hits

| Tool       | Description                                    | Required params       |
| ---------- | ---------------------------------------------- | --------------------- |
| list_hits  | List all accessible hits                       | —                     |
| create_hit | Create a hit at a count in a choreo            | name, count, choreoId |
| update_hit | Update a hit's name and/or member associations | id, [name, memberIds] |
| delete_hit | Delete a hit                                   | id                    |

**Count numbering:** Counts are 0-based and must be < choreo.counts.
For a 32-count choreo, valid counts are 0-31.

### Lineups

| Tool          | Description                            | Required params                |
| ------------- | -------------------------------------- | ------------------------------ |
| list_lineups  | List lineups for a choreography        | choreoId                       |
| create_lineup | Create a lineup covering a count range | startCount, endCount, choreoId |
| update_lineup | Update a lineup's count range          | id, [startCount, endCount]     |
| delete_lineup | Delete a lineup                        | id                             |

**Note:** Unlike other list tools, `list_lineups` requires `choreoId` because lineups are always scoped to a specific choreography.

**Count range:** `endCount` must be > `startCount`. Lineups define formation segments.

### Positions

| Tool            | Description                          | Required params          |
| --------------- | ------------------------------------ | ------------------------ |
| list_positions  | List positions for a lineup          | lineupId                 |
| create_position | Place a member at (x, y) in a lineup | x, y, lineupId, memberId |
| update_position | Move a position                      | id, [x, y]               |
| delete_position | Delete a position                    | id                       |

**Coordinates:** X and Y are percentage values (0-100) representing position on the mat.

- X: 0 = left edge, 100 = right edge
- Y: 0 = top edge, 100 = bottom edge

## Response Formats

All tools return JSON. Common response shapes:

**list\_\* tools return arrays:**

```json
[{ "id": "550e8400-e29b-41d4-a716-446655440000", "name": "My Club" }]
```

**get\_\* tools return single objects with nested relations:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Club",
  "teams": [],
  "seasonTeams": []
}
```

**delete\_\* tools return success status:**

```json
{ "success": true }
```

**Errors return isError: true:**

```json
{ "error": "Club with ID xyz not found", "isError": true }
```

## Error Handling

Common errors and their meanings:

| Error              | Cause                                                        |
| ------------------ | ------------------------------------------------------------ |
| `Not found`        | Entity with given ID doesn't exist or user lacks access      |
| `Validation error` | Required params missing or invalid (e.g. count out of range) |
| `Unauthorized`     | Missing or invalid JWT token                                 |
| `Forbidden`        | User doesn't have permission to access/modify this entity    |

When an error occurs, tools return `{ "error": "...", "isError": true }`.

## Typical Workflow

Here's a concrete example of setting up a choreography:

```
1. list_clubs
   → Returns: [{ id: "abc-123", name: "Phoenix Allstars" }]

2. list_seasons
   → Returns: [{ id: "def-456", name: "Summer 2026", year: 2026 }]

3. create_team(name: "Senior Elite", clubId: "abc-123", seasonId: "def-456")
   → Returns: { id: "ghi-789", name: "Senior Elite" }

4. create_season_team(teamId: "ghi-789", seasonId: "def-456")
   → Returns: { id: "jkl-012", teamId: "ghi-789", seasonId: "def-456" }

5. create_member(name: "Anna Berger", nickname: "Anna", abbreviation: "AB", seasonTeamId: "jkl-012")
   → Returns: { id: "mem-001", name: "Anna Berger", abbreviation: "AB" }

6. create_choreo(name: "Opening Routine", counts: 32, seasonTeamId: "jkl-012", participants: [{ id: "mem-001" }])
   → Returns: { id: "choreo-001", name: "Opening Routine", counts: 32 }

7. create_hit(name: "First Tumble", count: 8, choreoId: "choreo-001", memberIds: ["mem-001"])
   → Returns: { id: "hit-001", name: "First Tumble", count: 8 }

8. create_lineup(startCount: 0, endCount: 16, choreoId: "choreo-001")
   → Returns: { id: "lineup-001", startCount: 0, endCount: 16 }

9. create_position(x: 50, y: 50, lineupId: "lineup-001", memberId: "mem-001")
   → Returns: { id: "pos-001", x: 50, y: 50 }
```

After creating entities, use `get_*` to fetch full details with nested relations.

## Notes

- All `list_*` tools return arrays; use `get_*` for full detail with nested relations.
- UUIDs are strings (e.g. "550e8400-e29b-41d4-a716-446655440000").
- Optional params shown in `[brackets]` above; omit them to leave the field unchanged.
- `create_position` uses `findOrCreate` — calling it with the same lineupId and memberId updates the existing position instead of creating a duplicate.
