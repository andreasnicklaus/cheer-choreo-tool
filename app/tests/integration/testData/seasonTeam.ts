import { defaultChoreos } from "./choreo";
import { defaultTeam } from "./defaultTeam";
import { defaultUserId } from "./defaultUserId";
import { defaultMembers } from "./member";
import { defaultSeasons } from "./season";

export const defaultSeasonTeams = [
  {
    id: "b0c75d64-4cf8-4a12-a76f-65549a0ab5e7",
    SeasonID: defaultSeasons[0].id,
    Season: defaultSeasons[0],
    Choreos: defaultChoreos,
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    Members: defaultMembers,
    Team: defaultTeam,
  },
  {
    id: "047efd99-663d-4de8-8b51-68ec9f424b72",
    SeasonID: defaultSeasons[1].id,
    Season: defaultSeasons[1],
    Choreos: [],
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    Members: defaultMembers,
    Team: defaultTeam,
  },
];
