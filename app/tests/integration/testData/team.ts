import { defaultUserId } from "./defaultUserId";
import { defaultSeasonTeams } from "./seasonTeam";

const defaultUser = {
  id: defaultUserId,
  username: "Default User",
};

export const defaultTeams: Team[] = [
  {
    id: "42096d07-a94c-41fe-870a-e8b8bd1c6ea0",
    name: "Default Team",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    SeasonTeams: defaultSeasonTeams,
    creatorId: defaultUserId,
    creator: defaultUser,
    updaterId: defaultUserId,
    updater: defaultUser,
    User: defaultUser,
  },
  {
    id: "6a238d60-8eff-4e13-a4c4-699cf1b27dcc",
    name: "Default Team 2",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    SeasonTeams: [defaultSeasonTeams[1]],
    creator: defaultUser,
    creatorId: defaultUserId,
    updater: defaultUser,
    updaterId: defaultUserId,
    User: defaultUser,
  },
];

export const sharedTeams: Team[] = [
  {
    id: "42096d07-a94c-41fe-870a-e8b8bd1c6ea0",
    name: "Default Team",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: "other-user-id",
    SeasonTeams: defaultSeasonTeams,
    creator: { ...defaultUser, id: "other-user-id", username: "Other User" },
    creatorId: "other-user-id",
    updater: { ...defaultUser, id: "other-user-id", username: "Other User" },
    updaterId: "other-user-id",
    User: { ...defaultUser, id: "other-user-id", username: "Other User" },
  },
];

interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  UserId: string;
  SeasonTeams: typeof defaultSeasonTeams;
  creator?: typeof defaultUser;
  creatorId?: string;
  updater?: typeof defaultUser;
  updaterId?: string;
  User?: typeof defaultUser;
}
