import { defaultUserId } from "./defaultUserId";
import { defaultUser } from "./user";

export const ownerUser = {
  id: "owner-id-123",
  username: "Owner User",
  email: "owner@choreo-planer.de",
  emailConfirmed: true,
};

export const childUser = {
  id: "child-id-456",
  username: "Child User",
  email: "child@choreo-planer.de",
  emailConfirmed: true,
};

export const pendingAccess = {
  id: "access-id-1",
  ownerUserId: ownerUser.id,
  childUserId: childUser.id,
  role: "coach",
  enabled: true,
  accepted: false,
  owner: ownerUser,
};

export const acceptedAccess = {
  id: "access-id-2",
  ownerUserId: ownerUser.id,
  childUserId: childUser.id,
  role: "assistant",
  enabled: true,
  accepted: true,
  owner: ownerUser,
};

export const disabledAccess = {
  id: "access-id-3",
  ownerUserId: ownerUser.id,
  childUserId: childUser.id,
  role: "athlete",
  enabled: false,
  accepted: true,
  owner: ownerUser,
};

export const managedByMe = [pendingAccess, acceptedAccess, disabledAccess];

export const sharedWithMe = [
  {
    id: "access-id-4",
    ownerUserId: ownerUser.id,
    childUserId: defaultUserId,
    role: "coach",
    enabled: true,
    accepted: false,
    owner: ownerUser,
  },
];
