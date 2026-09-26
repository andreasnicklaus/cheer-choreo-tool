import { AccessDeniedError, NotFoundError } from "@/utils/errors";
import User from "../db/models/user";
import UserAccess, { AccessRole } from "../db/models/userAccess";
import FeatureFlagService, { FeatureFlagKey } from "./FeatureFlagService";

const { logger } = require("../plugins/winston");

/**
 * Service for managing user access relationships.
 * Handles CRUD operations for owner-child access permissions.
 * A child can have access to multiple owners.
 *
 * @class UserAccessService
 */
class UserAccessService {
  /**
   * Check if the ACCESS_SHARING feature flag is enabled.
   * @returns {Promise<boolean>} True if access sharing is enabled.
   */
  async isAccessSharingEnabled(): Promise<boolean> {
    return FeatureFlagService.isEnabled(FeatureFlagKey.ACCESS_SHARING);
  }

  /**
   * Find a user access relationship by owner and child IDs.
   * @param {UUID} ownerId - The owner's user ID.
   * @param {UUID} childId - The child's user ID.
   * @returns {Promise<UserAccess | null>} The user access object or null if not found.
   */
  async findByOwnerAndChild(ownerId: string, childId: string) {
    if (!(await this.isAccessSharingEnabled())) return null;
    logger.debug(
      `UserAccessService findByOwnerAndChild ${JSON.stringify({ ownerId, childId })}`,
    );
    return UserAccess.findOne({
      where: { ownerUserId: ownerId, childUserId: childId },
    });
  }

  /**
   * Get all children for an owner.
   * @param {UUID} ownerId - The owner's user ID.
   * @returns {Promise<Array>} Array of user access objects.
   */
  async getChildren(ownerId: string) {
    if (!(await this.isAccessSharingEnabled())) return [];
    logger.debug(
      `UserAccessService getChildren ${JSON.stringify({ ownerId })}`,
    );
    return UserAccess.findAll({
      where: { ownerUserId: ownerId },
      include: [{ model: User, as: "child" }],
    });
  }

  /**
   * Get all owners for a child.
   * @param {UUID} childId - The child's user ID.
   * @returns {Promise<Array>} Array of user access objects.
   */
  async getOwners(childId: string) {
    if (!(await this.isAccessSharingEnabled())) return [];
    logger.debug(`UserAccessService getOwners ${JSON.stringify({ childId })}`);
    return UserAccess.findAll({
      where: { childUserId: childId },
      include: [{ model: User, as: "owner" }],
    });
  }

  /**
   * Create a new user access relationship.
   * @param {UUID} ownerId - The owner's user ID.
   * @param {UUID} childId - The child's user ID.
   * @param {AccessRole} role - The access role.
   * @param {boolean} enabled - Whether the access is enabled.
   * @returns {Promise<UserAccess>} The created user access object.
   */
  async create(
    ownerId: string,
    childId: string,
    role: AccessRole = AccessRole.ATHLETE,
    enabled: boolean = true,
  ) {
    if (!(await this.isAccessSharingEnabled())) {
      throw new AccessDeniedError("Access sharing is disabled");
    }
    logger.debug(
      `UserAccessService create ${JSON.stringify({ ownerId, childId, role, enabled })}`,
    );

    const existing = await UserAccess.findOne({
      where: { ownerUserId: ownerId, childUserId: childId },
    });

    if (existing) {
      throw new Error("User access relationship already exists");
    }

    return UserAccess.create({
      ownerUserId: ownerId,
      childUserId: childId,
      role,
      enabled,
    });
  }

  /**
   * Update an existing user access relationship.
   * @param {UUID} id - The user access ID.
   * @param {object} data - The data to update (role, enabled).
   * @param {UUID} ownerId - The owner's user ID (for authorization).
   * @returns {Promise<UserAccess>} The updated user access object.
   */
  async update(
    id: string,
    data: { role?: AccessRole; enabled?: boolean },
    ownerId: string,
  ) {
    if (!(await this.isAccessSharingEnabled())) {
      throw new AccessDeniedError("Access sharing is disabled");
    }
    logger.debug(
      `UserAccessService update ${JSON.stringify({ id, data, ownerId })}`,
    );

    const access = await UserAccess.findOne({
      where: { id, ownerUserId: ownerId },
    });

    if (!access) {
      throw new NotFoundError(`User access with id ${id} not found`);
    }

    return access.update(data);
  }

  /**
   * Remove a user access relationship.
   * @param {UUID} id - The user access ID.
   * @param {UUID} ownerId - The owner's user ID (for authorization).
   * @returns {Promise<void>}
   */
  async remove(id: string, ownerId: string) {
    if (!(await this.isAccessSharingEnabled())) {
      throw new AccessDeniedError("Access sharing is disabled");
    }
    logger.debug(`UserAccessService remove ${JSON.stringify({ id, ownerId })}`);

    const access = await UserAccess.findOne({
      where: { id, ownerUserId: ownerId },
    });

    if (!access) {
      throw new NotFoundError(`User access with id ${id} not found`);
    }

    return access.destroy();
  }

  /**
   * Accept an access invitation.
   * @param {UUID} id - The user access ID.
   * @param {UUID} childId - The child's user ID (for authorization).
   * @returns {Promise<UserAccess>} The updated user access object.
   */
  async accept(id: string, childId: string) {
    if (!(await this.isAccessSharingEnabled())) {
      throw new AccessDeniedError("Access sharing is disabled");
    }
    logger.debug(`UserAccessService accept ${JSON.stringify({ id, childId })}`);

    const access = await UserAccess.findOne({
      where: { id, childUserId: childId },
    });

    if (!access) {
      throw new NotFoundError(`User access with id ${id} not found`);
    }

    return access.update({ accepted: true });
  }

  /**
   * Decline an access invitation.
   * @param {UUID} id - The user access ID.
   * @param {UUID} childId - The child's user ID (for authorization).
   * @returns {Promise<UserAccess>} The deleted user access object.
   */
  async decline(id: string, childId: string) {
    if (!(await this.isAccessSharingEnabled())) {
      throw new AccessDeniedError("Access sharing is disabled");
    }
    logger.debug(
      `UserAccessService decline ${JSON.stringify({ id, childId })}`,
    );

    const access = await UserAccess.findOne({
      where: { id, childUserId: childId },
    });

    if (!access) {
      throw new NotFoundError(`User access with id ${id} not found`);
    }

    return access.destroy();
  }

  /**
   * Find a user by username.
   * @param {string} username - The username to search for.
   * @returns {Promise<User | null>} The user object or null if not found.
   */
  async findByUsername(username: string) {
    return User.findOne({ where: { username } });
  }

  /**
   * Check if a user has access to another user's data.
   * @param {UUID} ownerId - The owner's user ID.
   * @param {UUID} childId - The child's user ID.
   * @returns {Promise<boolean>} Whether the child has access.
   */
  async hasAccess(ownerId: string, childId: string) {
    if (!(await this.isAccessSharingEnabled())) return false;
    const access = await UserAccess.findOne({
      where: {
        ownerUserId: ownerId,
        childUserId: childId,
        enabled: true,
        accepted: true,
      },
    });
    return !!access;
  }

  /**
   * Get the role for a child accessing owner's data.
   * @param ownerId - The owner's user ID.
   * @param childId - The child's user ID.
   * @returns {Promise<AccessRole | null>} The role or null if no access.
   */
  async getRole(ownerId: string, childId: string) {
    if (!(await this.isAccessSharingEnabled())) return null;
    const access = await UserAccess.findOne({
      where: {
        ownerUserId: ownerId,
        childUserId: childId,
        enabled: true,
        accepted: true,
      },
    });
    return access?.role || null;
  }
}

export default new UserAccessService();
