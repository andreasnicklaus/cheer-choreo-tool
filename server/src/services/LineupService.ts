import { FaultyInputError, NotFoundError } from "@/utils/errors";
import { withLineupConflictGuard } from "@/utils/lineupConflictGuard";
import { getTransaction } from "@/utils/transactionContext";
import Lineup from "../db/models/lineup";
import ChoreoService from "./ChoreoService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
} from "../utils/accessControl";
import { stripProtectedUpdateFields } from "@/utils/stripProtectedFields";

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

    return withLineupConflictGuard([ChoreoId], async () => {
      const transaction = getTransaction();
      const lineup = await Lineup.create(
        {
          startCount,
          endCount,
          ChoreoId,
          UserId: ownerId,
          creatorId: actingUserId,
          updaterId: actingUserId,
        },
        { transaction },
      );
      await ChoreoService.update(
        ChoreoId,
        {},
        actingUserId,
        isAdmin,
        { all: false },
        transaction,
      );
      return lineup;
    });
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

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    logger.info(
      `Finding or creating lineup with startCount ${startCount}, endCount ${endCount}, ChoreoId ${ChoreoId}, ownerId ${ownerId}`,
    );
    const [lineup, _created] = await withLineupConflictGuard(
      [ChoreoId],
      async () => {
        const [found, created] = await Lineup.findOrCreate({
          where: { startCount, endCount, ChoreoId, UserId: ownerId },
          defaults: {
            startCount,
            endCount,
            ChoreoId,
            UserId: ownerId,
            creatorId: actingUserId,
            updaterId: actingUserId,
          },
          transaction: getTransaction(),
        });
        return [found, created] as const;
      },
    );
    logger.info(
      `Lineup findOrCreate result: ${JSON.stringify({
        lineup: lineup.toJSON(),
        created: _created,
      })}`,
    );
    return lineup;
  }

  /**
   * Update a lineup's count range.
   *
   * Rejects any attempt to move the lineup to another choreography. When the
   * count range actually changes, the update runs under the lineup conflict
   * guard so it is rejected if it would overlap another lineup or put a member
   * in two overlapping lineups; a timestamp-only update skips the guard.
   *
   * @param {UUID} id - The lineup ID.
   * @param {Object} data - Fields to update (e.g. `startCount`, `endCount`).
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false] - Whether the acting user is an admin.
   * @returns {Promise<Object>} The updated lineup with its positions and members.
   * @throws {NotFoundError} If no lineup exists with the given ID.
   * @throws {FaultyInputError} If `data` contains `ChoreoId`/`choreoId`
   * (lineups cannot be moved between choreographies).
   * @throws {LineupConflictError} If a range change introduces a lineup overlap
   * or member conflict.
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

    const updates = stripProtectedUpdateFields(data) as Record<string, unknown>;
    if (
      Object.prototype.hasOwnProperty.call(updates, "ChoreoId") ||
      Object.prototype.hasOwnProperty.call(updates, "choreoId")
    ) {
      throw new FaultyInputError(
        "Lineups cannot be moved to another choreography",
      );
    }

    const applyUpdate = async () => {
      const transaction = getTransaction();
      await lineup.update(
        {
          ...updates,
          updaterId: actingUserId,
        },
        { transaction },
      );
      await ChoreoService.update(
        lineup.ChoreoId,
        {},
        actingUserId,
        isAdmin,
        { all: false },
        transaction,
      );
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
        transaction,
      }); // njsscan-ignore: node_nosqli_injection
    };

    const rangeChanged =
      (Object.prototype.hasOwnProperty.call(updates, "startCount") &&
        updates.startCount !== lineup.startCount) ||
      (Object.prototype.hasOwnProperty.call(updates, "endCount") &&
        updates.endCount !== lineup.endCount);

    if (!rangeChanged) {
      return applyUpdate();
    }

    // Only a range change can create or resolve an overlap, so a timestamp-only
    // touch skips the guard and its two snapshot queries.
    return withLineupConflictGuard([lineup.ChoreoId], applyUpdate);
  }

  /**
   * Bump a lineup's timestamp without touching its range.
   * @param {UUID} id - The lineup ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The updated lineup.
   */
  async touch(id: string, actingUserId: string, isAdmin = false) {
    return this.update(id, {}, actingUserId, isAdmin);
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

    return withLineupConflictGuard([lineup.ChoreoId], async () => {
      const transaction = getTransaction();
      await ChoreoService.update(
        lineup.ChoreoId,
        {},
        actingUserId,
        isAdmin,
        { all: false },
        transaction,
      );
      return lineup.destroy({ transaction });
    });
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
