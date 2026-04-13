import { NotFoundError } from "@/utils/errors";
import Lineup from "../db/models/lineup";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
} from "../utils/accessControl";

const { logger } = require("../plugins/winston");

/**
 * Service for managing lineup entities and their associations.
 * Handles CRUD operations and lineup-specific logic.
 *
 * @class LineupService
 */
class LineupService {
  /**
   * Create a new lineup.
   * @param {number} startCount - The start count of the lineup.
   * @param {number} endCount - The end count of the lineup.
   * @param {UUID} ChoreoId - The choreography ID.
   * @param {UUID} ownerId - The owner ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The created lineup.
   */
  async create(
    startCount: number,
    endCount: number,
    ChoreoId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `LineupService create ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Lineup.create({
      startCount,
      endCount,
      ChoreoId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    });
  }

  /**
   * Find or create a lineup.
   * @param {number} startCount - The start count of the lineup.
   * @param {number} endCount - The end count of the lineup.
   * @param {UUID} ChoreoId - The choreography ID.
   * @param {UUID} ownerId - The owner ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The found or created lineup.
   */
  async findOrCreate(
    startCount: number,
    endCount: number,
    ChoreoId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `LineupService findOrCreate ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const [lineup, _created] = await Lineup.findOrCreate({
      where: { startCount, endCount, ChoreoId, UserId: ownerId },
      defaults: {
        startCount,
        endCount,
        ChoreoId,
        UserId: ownerId,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    return lineup;
  }

  /**
   * Update a lineup.
   * @param {UUID} id - The lineup ID.
   * @param {Object} data - The data to update.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The updated lineup.
   */
  async update(
    id: string,
    data: object,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `LineupService update ${JSON.stringify({ id, data, actingUserId, isAdmin })}`,
    );

    const lineup = await Lineup.findByPk(id);
    if (!lineup) {
      throw new NotFoundError(`No lineup found with ID ${id} when updating`);
    }

    await checkWriteAccess(lineup.UserId, actingUserId, isAdmin);

    await lineup.update({
      ...data,
      updaterId: actingUserId,
    });
    await lineup.save();
    return Lineup.findOne({
      where: { id },
      include: [
        {
          association: "Positions",
          include: [
            {
              association: "Member",
            },
          ],
        },
      ],
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Find a lineup by ID.
   * @param {UUID} id - The lineup ID.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The found lineup.
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `LineupService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const lineup = await Lineup.findByPk(id);
    if (!lineup) {
      return null;
    }

    await checkReadAccess(lineup.UserId, actingUserId, isAdmin);

    return Lineup.findOne({ where: { id } }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get all lineups for a choreography.
   * @param {UUID} ChoreoId - The choreography ID.
   * @returns {Promise<Array>} List of lineups.
   */
  async findByChoreoId(ChoreoId: string) {
    logger.debug(
      `LineupService findByChoreoId ${JSON.stringify({ ChoreoId })}`,
    );
    return Lineup.findAll({ where: { ChoreoId } });
  }

  /**
   * Remove a lineup.
   * @param {UUID} id - The lineup ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<void>} Resolves when the lineup is removed.
   */
  async remove(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `LineupService remove ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const lineup = await Lineup.findByPk(id);
    if (!lineup) {
      throw new NotFoundError(`No lineup found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(lineup.UserId, actingUserId, isAdmin);

    return lineup.destroy();
  }
}

export default new LineupService();
