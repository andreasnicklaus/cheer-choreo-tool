import { NotFoundError, RequestOrderError } from "./../utils/errors";
import Position from "../db/models/position";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");

/**
 * Service for managing position entities and their associations.
 * Handles CRUD operations and position-specific logic.
 *
 * @class PositionService
 */
class PositionService {
  /**
   * Create a new position.
   * @param {number} x - The x-coordinate of the position.
   * @param {number} y - The y-coordinate of the position.
   * @param {UUID} ownerId - The owner ID associated with the position.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Date} [timeOfManualUpdate=new Date()]
   * @returns {Promise<Object>} The created position.
   */
  async create(
    x: number,
    y: number,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
    timeOfManualUpdate: Date = new Date(),
  ) {
    logger.debug(
      `PositionService create ${JSON.stringify({
        x,
        y,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Position.create({
      x,
      y,
      timeOfManualUpdate,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    });
  }

  /**
   * Find or create a position.
   * @param {number} x - The x-coordinate of the position.
   * @param {number} y - The y-coordinate of the position.
   * @param {UUID} LineupId - The lineup ID associated with the position.
   * @param {UUID} MemberId - The member ID associated with the position.
   * @param {UUID} ownerId - The owner ID associated with the position.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Date} [timeOfManualUpdate=new Date()]
   * @returns {Promise<Object>} The found or created position.
   */
  async findOrCreate(
    x: number,
    y: number,
    LineupId: string,
    MemberId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
    timeOfManualUpdate: Date = new Date(),
  ) {
    logger.debug(
      `PositionService findOrCreate ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const [position, _created] = await Position.findOrCreate({
      where: { x, y, LineupId, MemberId, UserId: ownerId },
      defaults: {
        x,
        y,
        LineupId,
        MemberId,
        UserId: ownerId,
        timeOfManualUpdate,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    return position;
  }

  /**
   * Get all positions for a lineup.
   * @param {UUID} LineupId - The lineup ID.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Array>} List of positions.
   */
  async findByLineupId(
    LineupId: string,
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `PositionService findByLineupId ${JSON.stringify({ LineupId, ownerIds, actingUserId, isAdmin })}`,
    );

    const accessibleOwnerIds =
      ownerIds && ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return Position.findAll({
      where:
        accessibleOwnerIds.length > 0
          ? { LineupId, UserId: { [Op.in]: accessibleOwnerIds } }
          : { LineupId },
      include: "Member",
    });
  }

  /**
   * Find a position by ID.
   * @param {UUID} id - The ID of the position.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object|null>} The found position or null if not found.
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `PositionService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const position = await Position.findByPk(id);
    if (!position) {
      return null;
    }

    await checkReadAccess(position.UserId, actingUserId, isAdmin);

    return Position.findOne({ where: { id }, include: "Member" }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Update a position.
   * @param {UUID} id - The ID of the position.
   * @param {string | null} lineupId - The lineup ID to verify position belongs to (optional filter).
   * @param {Object} data - The data to update the position with.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The updated position.
   * @throws Will throw an error if the position is not found.
   */
  async update(
    id: string,
    lineupId: string | null,
    data: { timeOfManualUpdate?: Date; y?: number; x?: number },
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `PositionService update ${JSON.stringify({
        id,
        data,
        actingUserId,
        isAdmin,
      })}`,
    );

    const position = await Position.findOne({
      where: lineupId ? { id, LineupId: lineupId } : { id },
    }); // njsscan-ignore: node_nosqli_injection
    if (!position) {
      throw new NotFoundError(`No position found with ID ${id} when updating`);
    }

    await checkWriteAccess(position.UserId, actingUserId, isAdmin);

    if (data.timeOfManualUpdate) {
      if (
        position.timeOfManualUpdate &&
        new Date(data.timeOfManualUpdate) <= position.timeOfManualUpdate
      ) {
        throw new RequestOrderError(
          `Ignoring update to position ${id} as timeOfManualUpdate is not more recent`,
        );
      }
    } else data.timeOfManualUpdate = new Date();

    await position.update({
      ...data,
      updaterId: actingUserId,
    });
    return position.save();
  }

  /**
   * Remove a position.
   * @param {UUID} id - The ID of the position.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<void>} Resolves when the position is removed.
   * @throws Will throw an error if the position is not found.
   */
  async remove(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `PositionService remove ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const position = await Position.findByPk(id);
    if (!position) {
      throw new NotFoundError(`No position found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(position.UserId, actingUserId, isAdmin);

    return position.destroy();
  }
}

export default new PositionService();
