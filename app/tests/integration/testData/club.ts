import { defaultUserId } from "./defaultUserId";
import { defaultTeams } from "./team";

export const defaultClubs = [
  {
    id: "20f5bc46-de1b-4316-beaa-df927bbe57fc",
    name: "Default Club",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    UserId: defaultUserId,
    Teams: defaultTeams,
    clubLogoExtension: null,
  },
  {
    id: "2ee01b97-b300-45aa-81e0-3f76dcf47255",
    name: "Default Club 2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    UserId: defaultUserId,
    Teams: null,
    clubLogoExtension: null,
  },
];
