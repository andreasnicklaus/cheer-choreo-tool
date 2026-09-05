# Cheer Choreo Tool — MCP Usage Guide

## Overview

This MCP server provides access to the Cheer Choreo Tool, a choreography planning application for cheerleading teams. It exposes tools for managing clubs, teams, seasons, members, choreographies, hits, lineups, and positions.

## Core Entities: Hits and Lineups

A choreography consists of two independent core entities: **hits** and **lineups**. Understanding their independence is essential.

- **Hits** describe _actions_ — named events like stunts, skills, or movements at a specific count. Hit names are built from a fixed set of parts (see the hits sub-guide). A hit is never a formation name or a free-text description.
- **Lineups** describe _formations_ — count ranges during which a set of member positions is held on the mat.

**They are independent.** A hit can exist without a lineup. A lineup can exist without a hit. They do not reference each other. You do not need to create a lineup before creating a hit, and hits do not need to correspond to lineup boundaries.

For detailed hit naming conventions, see the hits sub-guide. For lineup rules, formation patterns, and position tables, see the lineups sub-guide.

## Agent Interaction Guidelines

Before creating any choreography data, the agent should clarify the user's intent:

1. **Ask what the choreo is for.** Is it for a competition, training session, showcase, or something else? This affects the length, complexity, and style of the choreography.
2. **Ask whether the user already has a choreo they want to digitize, or is starting from scratch.**
   - **Digitizing an existing choreo:** The user has positions and hits planned on paper, in another tool, or in their head. The workflow is bulk-creating positions and hits to match the existing plan. Ask the user to describe or share their choreography plan (e.g. count-by-count breakdown, formation diagrams).
   - **Starting from scratch:** The user needs guidance on building a choreography from the beginning. Walk them through the workflow step by step — choosing a mat type, creating the choreo, adding members, then building lineups and hits iteratively.
3. **Ask about team size and member count** before creating any positions. The member count directly determines which formation patterns are available.

Only after these questions are answered should the agent begin creating clubs, teams, members, or choreographies.

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

| Tool        | Description                                    | Required params       |
| ----------- | ---------------------------------------------- | --------------------- |
| list_hits   | List all accessible hits                       | —                     |
| create_hit  | Create a hit at a count in a choreo            | name, count, choreoId |
| create_hits | Bulk create multiple hits in a choreo          | choreoId, hits[]      |
| update_hit  | Update a hit's name and/or member associations | id, [name, memberIds] |
| delete_hit  | Delete a hit                                   | id                    |

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

| Tool             | Description                            | Required params                       |
| ---------------- | -------------------------------------- | ------------------------------------- |
| list_positions   | List positions for a lineup            | lineupId                              |
| create_position  | Place a member at (x, y) in a lineup   | x, y, lineupId, memberId              |
| create_positions | Bulk create all positions for a lineup | lineupId, positions[{x, y, memberId}] |
| update_position  | Move a position                        | id, [x, y]                            |
| delete_position  | Delete a position                      | id                                    |

**Coordinates:** X and Y are percentage values (0-100) representing position on the mat.

- X: 0 = right edge, 100 = left edge
- Y: 0 = front of mat (audience side), 100 = back of mat

Reference points: (0, 0) = front right, (100, 0) = front left, (0, 100) = back right, (100, 100) = back left.

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

7. create_hit(name: "Elevator", count: 8, choreoId: "choreo-001", memberIds: ["mem-001"])
   → Returns: { id: "hit-001", name: "Elevator", count: 8 }

8. create_lineup(startCount: 0, endCount: 16, choreoId: "choreo-001")
   → Returns: { id: "lineup-001", startCount: 0, endCount: 16 }

9. create_positions(lineupId: "lineup-001", positions: [{x: 50, y: 50, memberId: "mem-001"}])
   → Returns: [{ id: "pos-001", x: 50, y: 50, MemberId: "mem-001" }]
```

After creating entities, use `get_*` to fetch full details with nested relations.

## Best Practices

### Choreo Creation

- **Hide IDs from users.** When presenting data back, show names and human-readable values, not UUIDs.
- **Check existing data first.** Before creating new entities, use `list_*` and `get_*` to understand what already exists.
- **Use `findOrCreate` for positions.** `create_position` with the same lineupId and memberId updates the existing position instead of creating a duplicate.
- **Prefer `create_positions` (bulk) over `create_position` (singular).** Creating positions one by one is slow. Use `create_positions` with an array of `{x, y, memberId}` objects whenever you need to place multiple members in a lineup.

## Notes

- All `list_*` tools return arrays; use `get_*` for full detail with nested relations.
- UUIDs are strings (e.g. "550e8400-e29b-41d4-a716-446655440000").
- Optional params shown in `[brackets]` above; omit them to leave the field unchanged.
- `create_position` uses `findOrCreate` — calling it with the same lineupId and memberId updates the existing position instead of creating a duplicate.
- `create_positions` bulk-creates all positions for a lineup in one call. Always prefer this over calling `create_position` multiple times.
- **MCP tools use lightweight access checks** — they load only the minimal data needed for authorization (choreography owner), not the full choreography graph. This makes bulk operations much more memory-efficient.
- For hit naming conventions and examples, refer to the hits sub-guide.
- For lineup rules, formation patterns, and position tables, refer to the lineups sub-guide.
