import { defaultTeams } from "./team";
import { defaultUser } from "./user";

export const defaultClubs = [
  {
    id: "20f5bc46-de1b-4316-beaa-df927bbe57fc",
    name: "Default Club",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUser.id,
    Teams: defaultTeams,
    clubLogoExtension: null,
  },
  {
    id: "2ee01b97-b300-45aa-81e0-3f76dcf47255",
    name: "Default Club 2",
    createdAt: "2025-06-09T10:37:01.158Z",
    updatedAt: "2025-06-09T10:37:01.158Z",
    deletedAt: null,
    UserId: defaultUser.id,
    Teams: null,
    clubLogoExtension: null,
  },
];
