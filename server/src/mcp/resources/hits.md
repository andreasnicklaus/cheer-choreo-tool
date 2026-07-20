# Hits Guide

## What is a Hit?

A Hit marks a named event — an action, stunt, or skill — at a specific count in a choreography. Hits are **independent from lineups**: a hit can exist without a corresponding lineup, and vice versa. There is no hit called "Formation 5" — hits describe _actions_, not _formations_.

## Hit Naming Convention

The UI generates hit names by combining up to four parts. Not every part is required — many valid hit names use only one or two parts.

### Name Structure

```txt
[PreDirection] [PreAction] [Action] [PostDirection]
```

Each bracket is optional. Parts that are omitted are simply left out of the final name.

### Pre-Directions

Prefix modifiers that describe the level of the action:

| Name | Description                   |
| ---- | ----------------------------- |
| High | Elevated / upward level       |
| Low  | Ground-level / downward level |

### Pre-Actions

Prefix modifiers that describe the preparation or entry into the action:

| Name    | Description            |
| ------- | ---------------------- |
| Set     | Set position           |
| Go      | Go / initiate          |
| Start   | Start                  |
| Dip     | Dip / preparation bend |
| Half up | Half-up position       |

### Actions

The core action or skill being performed:

- V
- Elevator
- Stretch
- Lib
- Tick Tock
- Scale
- Arabesque
- Bike turn
- Arch walk
- Flick Flack
- Penguin
- Playmobile
- Clap
- Toetouch
- Pyra
- Split
- Kneel
- Kneeling
- Full around
- Half Around
- Trophy
- Basket
- Log roll
- Cradle
- Throw
- 1 – 9

### Post-Directions

Suffix modifiers that describe the direction of the action:

- to the right
- right
- to the left
- left
- to the back
- back
- forward
- front

### Standalone Hits

Some hit names do not follow the combination pattern. These are used as-is:

| Name        | Description                |
| ----------- | -------------------------- |
| Clean       | Clean / neutral position   |
| Set down    | Set down / place on ground |
| Run         | Run off                    |
| Switch grip | Regrip                     |
| Grab        | Grip / grab                |
| End         | End                        |

## Example Hit Names

| Hit Name                | Parts Used                         |
| ----------------------- | ---------------------------------- |
| Elevator                | Action only                        |
| High Set Elevator       | PreDir + PreAct + Action           |
| Low Lib Stretch left    | PreDir + PreAct + Action + PostDir |
| Clean                   | Standalone                         |
| Trophy back             | Action + PostDir                   |
| Half up Cradle          | PreAct + Action                    |
| High Scale to the right | PreDir + Action + PostDir          |
| Dip Flick Flack         | PreAct + Action                    |
| Start Pyra to the left  | PreAct + Action + PostDir          |
| Set down                | Standalone                         |

## Agent Guidance

- **Use the naming convention.** When creating hits, use names that follow the `[PreDirection] [PreAction] [Action] [PostDirection]` structure. Pick the parts that describe what the members are actually doing at that count.
- **Hits are not formations.** A hit like "Formation 5" is not valid. Hits describe _actions_ (elevators, stretches, skills), not _where people stand_.
- **Hits do not need a matching lineup.** A hit can exist at a count where no lineup is defined. A lineup can exist at a count where no hit is defined. They are independent.
- **Associate members with hits.** When creating a hit, specify which members perform the action. Not every member needs to be in every hit, but it is the most common case that all members are part of a hit.
