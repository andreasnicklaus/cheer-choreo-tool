import { defaultClubs } from "./club";
import { defaultUserId } from "./defaultUserId";

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
};
