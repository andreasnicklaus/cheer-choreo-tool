import { defaultClubs } from "./club";
import { defaultUserId } from "./defaultUserId";
import { ownerUser } from "./userAccess";

export type UserAccess = {
  id: string;
  ownerUserId: string;
  childUserId: string;
  role: string;
  enabled: boolean;
  accepted: boolean;
  owner: typeof ownerUser;
};

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastLoggedIn: string;
  deletedAt: string | null;
  username: string;
  email: string;
  emailConfirmed: boolean;
  profilePictureExtension: string | null;
  Clubs: typeof defaultClubs;
  childAccess?: UserAccess[];
};

export const defaultUser: User = {
  id: defaultUserId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLoggedIn: new Date().toISOString(),
  deletedAt: null,
  username: "Default User",
  email: "default.user@choreo-planer.de",
  emailConfirmed: true,
  profilePictureExtension: null,
  Clubs: defaultClubs,
  childAccess: [],
};

export const sharedUser: User = {
  ...defaultUser,
  childAccess: [
    {
      id: "access-shared-1",
      ownerUserId: ownerUser.id,
      childUserId: defaultUserId,
      role: "coach",
      enabled: true,
      accepted: true,
      owner: ownerUser,
    },
  ],
};
