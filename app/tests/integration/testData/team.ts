import { defaultChoreos } from "./choreo";
import { defaultUserId } from "./defaultUserId";
import { defaultSeasonTeams } from "./seasonTeam";

export const defaultTeams = [
  {
    id: "42096d07-a94c-41fe-870a-e8b8bd1c6ea0",
    name: "Default Team",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    Choreos: defaultChoreos,
    SeasonTeams: defaultSeasonTeams,
  },
  {
    id: "6a238d60-8eff-4e13-a4c4-699cf1b27dcc",
    name: "Default Team 2",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    Choreos: defaultChoreos,
    SeasonTeams: defaultSeasonTeams,
  },
];

export const defaultTeam = {
  id: "42096d07-a94c-41fe-870a-e8b8bd1c6ea0",
  name: "Default Team",
  createdAt: "2025-06-09T10:37:01.158Z",
  updatedAt: "2025-06-09T10:37:01.158Z",
  deletedAt: null,
  UserId: defaultUserId,
};
