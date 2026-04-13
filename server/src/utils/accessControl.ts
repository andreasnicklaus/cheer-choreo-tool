import UserAccessService from "../services/UserAccessService";
import { AccessRole } from "../db/models/userAccess";
import { AccessDeniedError } from "./errors";

/**
 * Check if the acting user has read access to resources owned by the given ownerId.
 * @param ownerId - The ID of the owner whose resources are being accessed
 * @param actingUserId - The ID of the user attempting to access the resource
 * @param isAdmin - Whether the acting user is an admin (admin has full access)
 * @returns Promise<boolean> - True if the user has read access
 */
export const canRead = async (
  ownerId: string,
  actingUserId: string,
  isAdmin?: boolean,
): Promise<boolean> => {
  if (ownerId === actingUserId || isAdmin) {
    return true;
  }

  const role = await UserAccessService.getRole(ownerId, actingUserId);
  return role !== null;
};

/**
 * Check if the acting user has write access to resources owned by the given ownerId.
 * Coaches and assistants have write access.
 * @param ownerId - The ID of the owner whose resources are being accessed
 * @param actingUserId - The ID of the user attempting to access the resource
 * @param isAdmin - Whether the acting user is an admin (admin has full access)
 * @returns Promise<boolean> - True if the user has write access
 */
export const canWrite = async (
  ownerId: string,
  actingUserId: string,
  isAdmin?: boolean,
): Promise<boolean> => {
  if (ownerId === actingUserId || isAdmin) {
    return true;
  }

  const role = await UserAccessService.getRole(ownerId, actingUserId);

  if (role === AccessRole.COACH || role === AccessRole.ASSISTANT) {
    return true;
  }

  return false;
};

/**
 * Check if the acting user has delete access to resources owned by the given ownerId.
 * Only coaches have delete access.
 * @param ownerId - The ID of the owner whose resources are being accessed
 * @param actingUserId - The ID of the user attempting to access the resource
 * @param isAdmin - Whether the acting user is an admin (admin has full access)
 * @returns Promise<boolean> - True if the user has delete access
 */
export const canDelete = async (
  ownerId: string,
  actingUserId: string,
  isAdmin?: boolean,
): Promise<boolean> => {
  if (ownerId === actingUserId || isAdmin) {
    return true;
  }

  const role = await UserAccessService.getRole(ownerId, actingUserId);

  if (role === AccessRole.COACH) {
    return true;
  }

  return false;
};

/**
 * Verify the acting user has read access to resources owned by the given ownerId.
 * Throws AccessDeniedError if access is denied.
 * @param ownerId - The ID of the owner whose resources are being accessed
 * @param actingUserId - The ID of the user attempting to access the resource
 * @param isAdmin - Whether the acting user is an admin (admin has full access)
 * @returns Promise<void>
 * @throws AccessDeniedError if access is denied
 */
export const checkReadAccess = async (
  ownerId: string,
  actingUserId: string,
  isAdmin?: boolean,
): Promise<void> => {
  const hasAccess = await canRead(ownerId, actingUserId, isAdmin);
  if (!hasAccess) {
    throw new AccessDeniedError("You do not have read access to this resource");
  }
};

/**
 * Verify the acting user has write access to resources owned by the given ownerId.
 * Throws AccessDeniedError if access is denied.
 * @param ownerId - The ID of the owner whose resources are being accessed
 * @param actingUserId - The ID of the user attempting to access the resource
 * @param isAdmin - Whether the acting user is an admin (admin has full access)
 * @returns Promise<void>
 * @throws AccessDeniedError if access is denied
 */
export const checkWriteAccess = async (
  ownerId: string,
  actingUserId: string,
  isAdmin?: boolean,
): Promise<void> => {
  const hasAccess = await canWrite(ownerId, actingUserId, isAdmin);
  if (!hasAccess) {
    throw new AccessDeniedError(
      "You do not have write access to this resource",
    );
  }
};

/**
 * Verify the acting user has delete access to resources owned by the given ownerId.
 * Throws AccessDeniedError if access is denied.
 * @param ownerId - The ID of the owner whose resources are being accessed
 * @param actingUserId - The ID of the user attempting to access the resource
 * @param isAdmin - Whether the acting user is an admin (admin has full access)
 * @returns Promise<void>
 * @throws AccessDeniedError if access is denied
 */
export const checkDeleteAccess = async (
  ownerId: string,
  actingUserId: string,
  isAdmin?: boolean,
): Promise<void> => {
  const hasAccess = await canDelete(ownerId, actingUserId, isAdmin);
  if (!hasAccess) {
    throw new AccessDeniedError(
      "You do not have delete access to this resource",
    );
  }
};

/**
 * Filter ownerIds to only include those the acting user has read access to.
 * This prevents false negatives when checking access for multiple owners.
 * @param ownerIds - Array of owner IDs to filter
 * @param actingUserId - The acting user ID
 * @param isAdmin - Whether the acting user is an admin
 * @returns Promise<string[]> - Filtered array of owner IDs the user can access
 */
export const filterAccessibleOwnerIds = async (
  ownerIds: string[],
  actingUserId: string,
  isAdmin?: boolean,
): Promise<string[]> => {
  if (ownerIds.length === 0) {
    return [];
  }

  const results = await Promise.all(
    ownerIds.map(async (ownerId) => {
      const hasAccess = await canRead(ownerId, actingUserId, isAdmin);
      return hasAccess ? ownerId : null;
    }),
  );

  return results.filter((id): id is string => id !== null);
};
