# Lineups Guide

## What is a Lineup?

A Lineup defines a **formation segment** within a choreography — the count range during which a specific set of member positions is held on the mat. Each lineup has a start count and end count, and contains positions that place members at specific (x, y) coordinates.

## Lineup Rules

These rules are critical. Violating them will produce a broken choreography.

### Length Limits

- **Lineups are typically 1–16 counts long.**
- **Never create a lineup longer than 16 counts.** Only ever create a lineup longer than 16 counts if the user specifically instructs you to.

### Gaps Between Lineups

- **Do not cover the entire choreography in lineups.** Leave gaps between lineups for transitions, walks, and other non-formation movement.
- **Breaks between lineups are typically 4–8 counts long.** A gap means no lineup is defined for those counts — this is intentional.

### Estimating Lineup Count

As a rough estimate: a choreography with **320 counts** should have between **10 and 160 lineups**. The exact number depends on how many formation changes the choreography contains.

| Choreo Length | Typical Lineup Count |
| ------------- | -------------------- |
| 32 counts     | 2–8                  |
| 64 counts     | 4–16                 |
| 128 counts    | 8–32                 |
| 320 counts    | 10–160               |

### Neighbouring Lineups Must Differ

**Neighbouring lineups can never be equal.** Two consecutive lineups must have different positions.

### Overlapping lineups only for different members

**If lineups overlap, then only for different members.** Multiple lineups on the same count are possible, for example if one half of participants moves while the other is stationary. A single member can never be part in two overlapping formations.

### Choreography must end with a lineup

**One lineup in every choreography must have `endCount` equal to the choreography's `counts`.** This ensures the choreography has an active formation all the way to the end. The last lineup typically spans the final few counts (e.g., if `counts=320`, a lineup with `startCount=316, endCount=320`).

## Choreography Length Guide

| Duration | Counts  | Description                           |
| -------- | ------- | ------------------------------------- |
| Short    | 32–64   | Quick intro/outro, transition segment |
| Medium   | 64–128  | Standard routine segment              |
| Long     | 128–384 | Full competition routine              |
| Extended | 384+    | Large-scale performance piece         |

Most competition choreos fall in the 256–384 count range. When creating a choreo, consider the music structure and how many formation changes are needed.

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
- **Not all lineups need all participants.** Some members may move off the mat, hold position, or be stationary during certain segments. Only create positions for active participants.
- **Positions don't need to match lineup counts.** A lineup spanning counts 0–15 can have positions that only appear for part of that range (the positions exist for the whole lineup duration). During that lineup, multiple hits may happen. Hits do not need to necessarily happen during a lineup.
- **Prefer update over delete+create.** When redoing a lineup, use `update_lineup` and `update_position` rather than deleting and recreating. This preserves entity history.

### Agent Guidance

- **Prefer bulk creation over singular position creation.** Creating positions one by one is slow. Use `create_positions` with an array of `{x, y, memberId}` objects whenever you need to place multiple members in a lineup.
- **Never create a lineup longer than 16 counts.** Break longer formation segments into multiple lineups.
- **Always leave gaps between lineups.** The gaps (4–8 counts) represent transitions and walks — they are not mistakes.
- **Neighbouring lineups must have different count ranges.** Two consecutive lineups with the same start/end counts are invalid.
