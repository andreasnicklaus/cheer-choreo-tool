import { NotFoundError } from "@/utils/errors";
import Hit from "../db/models/hit";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { logger } = require("../plugins/winston");
const { Op } = require("sequelize");

/**
 * Service for managing Hit entities and their associations.
 * Handles CRUD operations and member associations for Hits.
 *
 * @class HitService
 */
class HitService {
  /**
   * Get all Hits for a user, including their members.
   *
   * @param {UUID[]} ownerIds - The owner's UUIDs.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<Array<Hit>>} List of Hit objects.
   */
  async getAll(ownerIds: string[], actingUserId: string, isAdmin = false) {
    logger.debug(
      `HitService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return Hit.findAll({
      where: { UserId: { [Op.in]: accessibleOwnerIds } },
      include: "Members",
    });
  }

  /**
   * Find a Hit by its ID and user, including all associations.
   * @param {UUID} id - The Hit's ID.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<Hit|null>} The found Hit or null.
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `HitService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const hit = await Hit.findByPk(id);
    if (!hit) {
      return null;
    }

    await checkReadAccess(hit.UserId, actingUserId, isAdmin);

    return Hit.findOne({
      where: { id },
      include: { all: true },
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Find all Hits by name for a user, including all associations.
   * @param {string} name - The Hit's name.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<Array<Hit>>} List of matching Hits.
   */
  async findByName(
    name: string,
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `HitService findByName ${JSON.stringify({ name, ownerIds, actingUserId, isAdmin })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return Hit.findAll({
      where:
        accessibleOwnerIds.length > 0
          ? { name, UserId: { [Op.in]: accessibleOwnerIds } }
          : { name },
      include: { all: true },
    });
  }

  /**
   * Create a new Hit and associate members if provided.
   * @param {string} name - The Hit's name.
   * @param {number} count - The count value.
   * @param {UUID} ChoreoId - The choreography ID.
   * @param {Array<string>} [memberIds=[]] - Array of member IDs.
   * @param {UUID} ownerId - The owner's UUID.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<Hit>} The created Hit with members.
   */
  async create(
    name: string,
    count: number,
    ChoreoId: string,
    memberIds: Array<string> = [],
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `HitService create ${JSON.stringify({
        name,
        count,
        ChoreoId,
        memberIds,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Hit.create({
      name,
      count,
      ChoreoId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    }).then(async (hit: Hit) => {
      if (memberIds.length > 0) await hit.setMembers(memberIds);
      return Hit.findByPk(hit.id, { include: "Members" });
    });
  }

  /**
   * Find or create a Hit by name, count, and choreography, and associate members.
   * @param {string} name - The Hit's name.
   * @param {number} count - The count value.
   * @param {UUID} ChoreoId - The choreography ID.
   * @param {Array<string>} [memberIds=[]] - Array of member IDs.
   * @param {UUID} ownerId - The owner's UUID.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<Hit>} The found or created Hit.
   */
  async findOrCreate(
    name: string,
    count: number,
    ChoreoId: string,
    memberIds: string[] = [],
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `HitService findOrCreate ${JSON.stringify({
        name,
        count,
        ChoreoId,
        memberIds,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const [hit, _created] = await Hit.findOrCreate({
      where: {
        name,
        count,
        ChoreoId,
        UserId: ownerId,
      },
      defaults: {
        name,
        count,
        ChoreoId,
        UserId: ownerId,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    await hit.setMembers(memberIds);
    return hit;
  }

  /**
   * Update a hit.
   * @param {UUID} id - The Hit's ID.
   * @param {Object} data - The update data.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<Hit>} The updated Hit.
   */
  async update(
    id: string,
    data: { id?: string; name?: string; memberIds?: Array<string> },
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `HitService update ${JSON.stringify({ id, data, actingUserId, isAdmin })}`,
    );

    const hit = await Hit.findByPk(id);
    if (!hit) {
      throw new NotFoundError(`No hit found with ID ${id} when updating`);
    }

    await checkWriteAccess(hit.UserId, actingUserId, isAdmin);

    await hit.update({
      ...data,
      updaterId: actingUserId,
    });
    await hit.save();
    if (data.memberIds) await hit.setMembers(data.memberIds);
    return hit;
  }

  /**
   * Remove a Hit by ID.
   * @param {UUID} id - The Hit's ID.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @returns {Promise<void>} Resolves when the Hit is removed.
   */
  async remove(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `HitService remove ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const hit = await Hit.findByPk(id);
    if (!hit) {
      throw new NotFoundError(`No hit found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(hit.UserId, actingUserId, isAdmin);

    return hit.destroy();
  }
}

export default new HitService();
