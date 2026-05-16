import { defaultTeam } from "./defaultTeam";
import { defaultUserId } from "./defaultUserId";
import { defaultUser } from "./user";
import { defaultHits } from "./hit";
import { defaultLineups } from "./lineup";
import { defaultMembers } from "./member";
import { defaultSeasons } from "./season";

const emptySeasonTeams = [
  {
    id: "047efd99-663d-4de8-8b51-68ec9f424b72",
    SeasonID: defaultSeasons[1].id,
    Season: defaultSeasons[1],
    Choreos: [],
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    Members: [],
    Team: defaultTeam,
  },
];

type Choreo = {
  id: string;
  name: string;
  counts: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  UserId: string;
  ClubId: string;
  Team: typeof defaultTeam;
  Hits: typeof defaultHits;
  Lineups: typeof defaultLineups;
  Participants: typeof defaultMembers;
  SeasonTeam: (typeof emptySeasonTeams)[0];
  creator?: typeof defaultUser;
  creatorId?: string;
  updater?: typeof defaultUser;
  updaterId?: string;
  User?: typeof defaultUser;
};

export const defaultChoreos: Choreo[] = [
  {
    id: "8047e84e-cebb-435a-8772-5709b9ab82f3",
    name: "Default Choreo",
    counts: 60,
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    ClubId: "20f5bc46-de1b-4316-beaa-df927bbe57fc",
    Team: defaultTeam,
    Hits: defaultHits,
    Lineups: defaultLineups,
    Participants: defaultMembers,
    SeasonTeam: emptySeasonTeams[0],
    creator: defaultUser,
    creatorId: defaultUserId,
    updater: defaultUser,
    updaterId: defaultUserId,
    User: defaultUser,
  },
];

export const emptyChoreos: Choreo[] = [
  {
    id: "8047e84e-cebb-435a-8772-5709b9ab82f3",
    name: "Default Choreo",
    counts: 60,
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUserId,
    ClubId: "20f5bc46-de1b-4316-beaa-df927bbe57fc",
    Team: defaultTeam,
    Hits: [],
    Lineups: [],
    Participants: [],
    SeasonTeam: emptySeasonTeams[0],
    creator: defaultUser,
    creatorId: defaultUserId,
    updater: defaultUser,
    updaterId: defaultUserId,
    User: defaultUser,
  },
];

export const sharedChoreos: Choreo[] = [
  {
    id: "8047e84e-cebb-435a-8772-5709b9ab82f3",
    name: "Shared Choreo",
    counts: 60,
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: "other-user-id",
    ClubId: "20f5bc46-de1b-4316-beaa-df927bbe57fc",
    Team: defaultTeam,
    Hits: defaultHits,
    Lineups: defaultLineups,
    Participants: defaultMembers,
    SeasonTeam: emptySeasonTeams[0],
    creator: { ...defaultUser, id: "other-user-id", username: "Other User" },
    creatorId: "other-user-id",
    updater: { ...defaultUser, id: "other-user-id", username: "Other User" },
    updaterId: "other-user-id",
    User: { ...defaultUser, id: "other-user-id", username: "Other User" },
  },
];
