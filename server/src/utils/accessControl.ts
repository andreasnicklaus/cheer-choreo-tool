import UserAccessService from "../services/UserAccessService";
import { AccessRole } from "../db/models/userAccess";
import { AccessDeniedError } from "./errors";

export const canRead = async (ownerId: string, actingUserId: string): Promise<boolean> => {
  if (ownerId === actingUserId) {
    return true;
  }

  const role = await UserAccessService.getRole(ownerId, actingUserId);
  return role !== null;
};

export const canWrite = async (ownerId: string, actingUserId: string): Promise<boolean> => {
  if (ownerId === actingUserId) {
    return true;
  }

  const role = await UserAccessService.getRole(ownerId, actingUserId);
  
  if (role === AccessRole.COACH || role === AccessRole.ASSISTANT) {
    return true;
  }
  
  return false;
};

export const canDelete = async (ownerId: string, actingUserId: string): Promise<boolean> => {
  if (ownerId === actingUserId) {
    return true;
  }

  const role = await UserAccessService.getRole(ownerId, actingUserId);
  
  if (role === AccessRole.COACH) {
    return true;
  }
  
  return false;
};

export const checkReadAccess = async (ownerId: string, actingUserId: string): Promise<void> => {
  const hasAccess = await canRead(ownerId, actingUserId);
  if (!hasAccess) {
    throw new AccessDeniedError("You do not have read access to this resource");
  }
};

export const checkWriteAccess = async (ownerId: string, actingUserId: string): Promise<void> => {
  const hasAccess = await canWrite(ownerId, actingUserId);
  if (!hasAccess) {
    throw new AccessDeniedError("You do not have write access to this resource");
  }
};

export const checkDeleteAccess = async (ownerId: string, actingUserId: string): Promise<void> => {
  const hasAccess = await canDelete(ownerId, actingUserId);
  if (!hasAccess) {
    throw new AccessDeniedError("You do not have delete access to this resource");
  }
};