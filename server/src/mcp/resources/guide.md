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

7. create_hit(name: "First Tumble", count: 8, choreoId: "choreo-001", memberIds: ["mem-001"])
   → Returns: { id: "hit-001", name: "First Tumble", count: 8 }

8. create_lineup(startCount: 0, endCount: 16, choreoId: "choreo-001")
   → Returns: { id: "lineup-001", startCount: 0, endCount: 16 }

9. create_position(x: 50, y: 50, lineupId: "lineup-001", memberId: "mem-001")
   → Returns: { id: "pos-001", x: 50, y: 50 }
```

After creating entities, use `get_*` to fetch full details with nested relations.

## Choreography Length Guide

| Duration | Counts  | Description                           |
| -------- | ------- | ------------------------------------- |
| Short    | 8–64    | Quick intro/outro, transition segment |
| Medium   | 64–128  | Standard routine segment              |
| Long     | 128-384 | Full competition routine              |
| Extended | 384+    | Large-scale performance piece         |

Most competition choreos fall in the 64–128 count range. When creating a choreo, consider the music structure and how many formation changes are needed.

## Position Combinations by Participant Count

Use these reference patterns when creating positions for lineups. All coordinates assume the mat coordinate system (X: 0=right, 100=left; Y: 0=front, 100=back). Center the formation on the mat by adjusting X/Y offsets.

### Single & Pairs (1–2)

| Count | Pattern      | Positions          |
| ----- | ------------ | ------------------ |
| 1     | Center       | (50, 50)           |
| 2     | Side by side | (40, 50), (60, 50) |

### Triangles & Small Groups (3–5)

| Count | Pattern  | Positions                                        |
| ----- | -------- | ------------------------------------------------ |
| 3     | Triangle | (50, 40), (40, 60), (60, 60)                     |
| 4     | Diamond  | (50, 30), (35, 50), (65, 50), (50, 70)           |
| 4     | Square   | (40, 40), (60, 40), (40, 60), (60, 60)           |
| 5     | Cross    | (50, 30), (30, 50), (50, 50), (70, 50), (50, 70) |
| 5     | Pentagon | (50, 30), (25, 45), (75, 55), (35, 70), (65, 70) |

### Medium Groups (6–10)

| Count | Pattern          | Positions                                                                                          |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------- |
| 6     | 2×3 Grid         | (35, 35), (50, 35), (65, 35), (35, 65), (50, 65), (65, 65)                                         |
| 6     | Hexagon          | (50, 30), (25, 40), (75, 40), (25, 60), (75, 60), (50, 70)                                         |
| 7     | Diamond + center | (50, 25), (30, 40), (50, 40), (70, 40), (30, 60), (50, 60), (70, 60)                               |
| 8     | 2×4 Grid         | (30, 30), (45, 30), (55, 30), (70, 30), (30, 70), (45, 70), (55, 70), (70, 70)                     |
| 8     | Octagon          | (40, 30), (60, 30), (25, 40), (75, 40), (25, 60), (75, 60), (40, 70), (60, 70)                     |
| 9     | 3×3 Grid         | (30, 30), (50, 30), (70, 30), (30, 50), (50, 50), (70, 50), (30, 70), (50, 70), (70, 70)           |
| 10    | 2×5 Grid         | (20, 30), (35, 30), (50, 30), (65, 30), (80, 30), (20, 70), (35, 70), (50, 70), (65, 70), (80, 70) |

### Large Groups (11–16)

| Count | Pattern            | Positions                                                                                                                                                      |
| ----- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11    | Diamond expand     | (50, 20), (30, 30), (50, 30), (70, 30), (20, 50), (50, 50), (80, 50), (30, 70), (50, 70), (70, 70), (50, 80)                                                   |
| 12    | 3×4 Grid           | (25, 30), (42, 30), (58, 30), (75, 30), (25, 50), (42, 50), (58, 50), (75, 50), (25, 70), (42, 70), (58, 70), (75, 70)                                         |
| 12    | Hexagon double     | (35, 30), (65, 30), (20, 50), (80, 50), (35, 70), (65, 70), (40, 45), (60, 45), (50, 50), (40, 55), (60, 55), (35, 50)                                         |
| 13    | Diamond + 3×3 core | (50, 20), (30, 35), (50, 35), (70, 35), (20, 50), (40, 50), (50, 50), (60, 50), (80, 50), (30, 65), (50, 65), (70, 65), (50, 80)                               |
| 14    | V formation        | (50, 25), (35, 35), (65, 35), (25, 45), (50, 45), (75, 45), (20, 55), (50, 55), (80, 55), (25, 65), (75, 65), (35, 75), (65, 75), (50, 85)                     |
| 15    | 3×5 Grid           | (20, 25), (35, 25), (50, 25), (65, 25), (80, 25), (20, 50), (35, 50), (50, 50), (65, 50), (80, 50), (20, 75), (35, 75), (50, 75), (65, 75), (80, 75)           |
| 16    | 4×4 Grid           | (25, 25), (42, 25), (58, 25), (75, 25), (25, 42), (42, 42), (58, 42), (75, 42), (25, 58), (42, 58), (58, 58), (75, 58), (25, 75), (42, 75), (58, 75), (75, 75) |

### Very Large Groups (17–25)

| Count | Pattern                | Positions                                                                                                                                                                                                                                                |
| ----- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 17    | Diamond + 4×4          | (50, 20), (30, 30), (50, 30), (70, 30), (20, 40), (40, 40), (60, 40), (80, 40), (50, 50), (20, 60), (40, 60), (60, 60), (80, 60), (30, 70), (50, 70), (70, 70), (50, 80)                                                                                 |
| 18    | 3×6 Grid               | (15, 25), (30, 25), (45, 25), (55, 25), (70, 25), (85, 25), (15, 50), (30, 50), (45, 50), (55, 50), (70, 50), (85, 50), (15, 75), (30, 75), (45, 75), (55, 75), (70, 75), (85, 75)                                                                       |
| 19    | Chevron                | (50, 20), (35, 30), (65, 30), (25, 40), (50, 40), (75, 40), (15, 50), (40, 50), (60, 50), (85, 50), (25, 60), (50, 60), (75, 60), (35, 70), (65, 70), (50, 80), (50, 35), (50, 65), (50, 45)                                                             |
| 20    | 4×5 Grid               | (15, 25), (30, 25), (50, 25), (70, 25), (85, 25), (15, 40), (30, 40), (50, 40), (70, 40), (85, 40), (15, 60), (30, 60), (50, 60), (70, 60), (85, 60), (15, 75), (30, 75), (50, 75), (70, 75), (85, 75)                                                   |
| 21    | Diamond + 4×4 + center | (50, 15), (30, 25), (50, 25), (70, 25), (20, 35), (40, 35), (60, 35), (80, 35), (15, 50), (35, 50), (50, 50), (65, 50), (85, 50), (20, 65), (40, 65), (60, 65), (80, 65), (30, 75), (50, 75), (70, 75), (50, 85)                                         |
| 22    | 2×11 spread            | (10, 30), (20, 30), (30, 30), (40, 30), (50, 30), (60, 30), (70, 30), (80, 30), (90, 30), (95, 30), (5, 30), (10, 70), (20, 70), (30, 70), (40, 70), (50, 70), (60, 70), (70, 70), (80, 70), (90, 70), (95, 70), (5, 70)                                 |
| 23    | W formation            | (30, 20), (70, 20), (20, 30), (40, 30), (60, 30), (80, 30), (30, 40), (50, 40), (70, 40), (15, 50), (35, 50), (50, 50), (65, 50), (85, 50), (30, 60), (50, 60), (70, 60), (20, 70), (40, 70), (60, 70), (80, 70), (30, 80), (70, 80)                     |
| 24    | 4×6 Grid               | (15, 20), (30, 20), (45, 20), (55, 20), (70, 20), (85, 20), (15, 40), (30, 40), (45, 40), (55, 40), (70, 40), (85, 40), (15, 60), (30, 60), (45, 60), (55, 60), (70, 60), (85, 60), (15, 80), (30, 80), (45, 80), (55, 80), (70, 80), (85, 80)           |
| 25    | 5×5 Grid               | (20, 20), (35, 20), (50, 20), (65, 20), (80, 20), (20, 35), (35, 35), (50, 35), (65, 35), (80, 35), (20, 50), (35, 50), (50, 50), (65, 50), (80, 50), (20, 65), (35, 65), (50, 65), (65, 65), (80, 65), (20, 80), (35, 80), (50, 80), (65, 80), (80, 80) |

### Cheer Stunt Groups (4–5 participants)

For counts with hits, positions typically represent stunt groups positioned close together:

| Count | Pattern               | Positions                                                                              |
| ----- | --------------------- | -------------------------------------------------------------------------------------- |
| 4     | Stunt group           | Back: (50, 70), Base L: (35, 50), Base R: (65, 50), Flyer: (50, 30)                    |
| 5     | Stunt group + spotter | Back: (50, 70), Base L: (35, 50), Base R: (65, 50), Flyer: (50, 30), Spotter: (65, 70) |

Multiple stunt groups should be spaced evenly across the mat (e.g., two groups at X=30 and X=70).

### Concentric Circles

| Count | Pattern           | Positions                                                                                                        |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| 5     | 1 inner + 4 outer | Inner: (50, 50), Outer: (35, 35), (35, 65), (65, 35), (65, 65)                                                   |
| 8     | 1 inner + 7 outer | Inner: (50, 50), Outer: (30, 50), (38, 25), (38, 75), (50, 15), (50, 85), (62, 25), (62, 75)                     |
| 9     | 1 inner + 8 outer | Inner: (50, 50), Outer: (30, 35), (30, 50), (30, 65), (50, 25), (50, 75), (70, 35), (70, 50), (70, 65)           |
| 10    | 2 inner + 8 outer | Inner: (45, 50), (55, 50), Outer: (30, 30), (30, 50), (30, 70), (50, 20), (50, 80), (70, 30), (70, 50), (70, 70) |

### Tips for Position Combinations

- **Mix patterns across lineups:** Use different formations (grid → diamond → V) to keep the choreo visually interesting.
- **Leave gaps:** Not every lineup needs positions for all participants. Some members may exit the mat or hold positions from a previous lineup.
- **Stunt groups:** For 4–5 person stunt groups, keep members close together with the flyer elevated (front/center), bases on sides, and back/spotter behind.
- **Adjust spacing:** These are reference coordinates. Scale positions closer together or further apart based on the mat type and team size.

## Best Practices

### Lineup & Position Management

- **Lineups need positions to be meaningful.** Always create positions for a lineup after creating it — an empty lineup is just a count range with no visual formation.
- **Leave gaps between lineups.** Don't make every lineup span the entire choreo. Gaps create natural transition points and keep formations interesting.
- **Not all lineups need all participants.** Some members may move the mat, hold position, or be stationary during certain segments. Only create positions for active participants.
- **Positions don't need to match lineup counts.** A lineup spanning counts 0–15 can have positions that only appear for part of that range (the positions exist for the whole lineup duration). During that lineup, multiple hits may happen. Hits do not need not necessarily happen during a lineup.
- **Prefer update over delete+create.** When redoing a lineup, use `update_lineup` and `update_position` rather than deleting and recreating. This preserves entity history.

### Choreo Creation

- **Hide IDs from users.** When presenting data back, show names and human-readable values, not UUIDs.
- **Check existing data first.** Before creating new entities, use `list_*` and `get_*` to understand what already exists.
- **Use `findOrCreate` for positions.** `create_position` with the same lineupId and memberId updates the existing position instead of creating a duplicate.

## Notes

- All `list_*` tools return arrays; use `get_*` for full detail with nested relations.
- UUIDs are strings (e.g. "550e8400-e29b-41d4-a716-446655440000").
- Optional params shown in `[brackets]` above; omit them to leave the field unchanged.
- `create_position` uses `findOrCreate` — calling it with the same lineupId and memberId updates the existing position instead of creating a duplicate.
