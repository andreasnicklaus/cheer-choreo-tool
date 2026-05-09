import { NotFoundError } from "@/utils/errors";
import Lineup from "../db/models/lineup";
import ChoreoService from "./ChoreoService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
} from "../utils/accessControl";

const { logger } = require("../plugins/winston");
const { Op } = require("sequelize");

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
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The created lineup.
   */
  async create(
    startCount: number,
    endCount: number,
    ChoreoId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `LineupService create ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        actingUserId,
        isAdmin,
      })}`,
    );

    // Inherit ownerId from parent Choreo
    const choreo = await ChoreoService.findById(
      ChoreoId,
      actingUserId,
      isAdmin,
    );
    if (!choreo) {
      throw new NotFoundError(`Choreo with ID ${ChoreoId} not found`);
    }
    const ownerId = choreo.UserId;

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const lineup = await Lineup.create({
      startCount,
      endCount,
      ChoreoId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    });
    await ChoreoService.update(ChoreoId, {}, actingUserId, isAdmin);
    return lineup;
  }

  /**
   * Find or create a lineup.
   * @param {number} x - The x-coordinate of the lineup.
   * @param {number} y - The y-coordinate of the lineup.
   * @param {UUID} LineupId - The lineup ID associated with the lineup.
   * @param {UUID} MemberId - The member ID associated with the lineup.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Date} [timeOfManualUpdate=new Date()]
   * @returns {Promise<Object>} The found or created lineup.
   */
  async findOrCreate(
    startCount: number,
    endCount: number,
    ChoreoId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.info(
      `LineupService findOrCreate ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        actingUserId,
        isAdmin,
      })}`,
    );

    // Inherit ownerId from parent Choreo
    const choreo = await ChoreoService.findById(
      ChoreoId,
      actingUserId,
      isAdmin,
    );
    if (!choreo) {
      logger.error(
        `Choreo with ID ${ChoreoId} not found when trying to findOrCreate lineup`,
      );
      throw new NotFoundError(`Choreo with ID ${ChoreoId} not found`);
    }
    const ownerId = choreo.UserId;

    await checkWriteAccess(ownerId, actingUserId, isAdmin).catch(logger.error);

    logger.info(
      `Finding or creating lineup with startCount ${startCount}, endCount ${endCount}, ChoreoId ${ChoreoId}, ownerId ${ownerId}`,
    );
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
    logger.info(
      `Lineup findOrCreate result: ${JSON.stringify({
        lineup: lineup.toJSON(),
        created: _created,
      })}`,
    );
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
    await ChoreoService.update(lineup.ChoreoId, {}, actingUserId, isAdmin);
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

    await ChoreoService.update(lineup.ChoreoId, {}, actingUserId, isAdmin);
    return lineup.destroy();
  }

  async migrateCreatorUpdater() {
    logger.debug(`LineupService migrateCreatorUpdater`);

    const lineups = await Lineup.findAll({
      where: { creatorId: { [Op.is]: null }, UserId: { [Op.not]: null } },
    });

    await Promise.all(
      lineups.map((lineup) =>
        lineup.update({ creatorId: lineup.UserId, updaterId: lineup.UserId }),
      ),
    );
  }
}

export default new LineupService();
