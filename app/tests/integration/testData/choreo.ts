import { defaultTeam } from "./defaultTeam";
import { defaultUserId } from "./defaultUserId";
import { defaultHits } from "./hit";
import { defaultLineups } from "./lineup";
import { defaultMembers } from "./member";

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
  },
];
