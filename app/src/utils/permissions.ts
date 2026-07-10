/**
 * Permission utility functions for checking user access rights
 * @module Util:Permissions
 */

import type { OwnerAccess } from "@/types/models";

/**
 * Check if user can WRITE to resources owned by ownerId
 * @param {OwnerAccess[]} owners - From $store.state.owners
 * @param {string} meId - Current user ID
 * @param {string} ownerId - Resource owner ID
 * @returns {boolean}
 */
export function canWrite(
  owners: OwnerAccess[],
  meId: string,
  ownerId: string
): boolean {
  // Owner always has write access
  if (meId === ownerId) return true;

  // Find the owner in owners list
  const ownerAccess = owners.find((o) => o.ownerUserId === ownerId);
  if (!ownerAccess) return false;

  // Coach and assistant have write access
  return ["coach", "assistant"].includes(ownerAccess.role);
}

/**
 * Check if user can DELETE resources owned by ownerId
 * @param {OwnerAccess[]} owners - From $store.state.owners
 * @param {string} meId - Current user ID
 * @param {string} ownerId - Resource owner ID
 * @returns {boolean}
 */
export function canDelete(
  owners: OwnerAccess[],
  meId: string,
  ownerId: string
): boolean {
  // Owner always has delete access
  if (meId === ownerId) return true;

  // Find the owner in owners list
  const ownerAccess = owners.find((o) => o.ownerUserId === ownerId);
  if (!ownerAccess) return false;

  // Only coach has delete access (not assistant)
  return ownerAccess.role === "coach";
}

/**
 * Check if user can READ resources owned by ownerId
 * @param {OwnerAccess[]} owners - From $store.state.owners
 * @param {string} meId - Current user ID
 * @param {string} ownerId - Resource owner ID
 * @returns {boolean}
 */
export function canRead(
  owners: OwnerAccess[],
  meId: string,
  ownerId: string
): boolean {
  if (meId === ownerId) return true;
  return owners.some((o) => o.ownerUserId === ownerId && o.enabled);
}
