import {
  FaultyInputError,
  NotFoundError,
  RequestOrderError,
} from "./../utils/errors";
import Position from "../db/models/position";
import Lineup from "../db/models/lineup";
import Choreo from "../db/models/choreo";
import Member from "../db/models/member";
import LineupService from "./LineupService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";
import { stripProtectedUpdateFields } from "@/utils/stripProtectedFields";
import { withLineupConflictGuard } from "@/utils/lineupConflictGuard";
import { getTransaction } from "@/utils/transactionContext";
import ChoreoService from "./ChoreoService";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");

/**
 * Load the member a position is being assigned to and assert it is usable.
 * Centralizes the existence check shared by position create, find-or-create, and
 * member reassignment so a position never references a missing member.
 *
 * @param {string} MemberId - The member being placed.
 * @returns {Promise<Member>} The loaded member.
 * @throws {NotFoundError} If no member exists with the given ID.
 */
async function assertUsableMember(MemberId: string): Promise<Member> {
  const member = await Member.findByPk(MemberId);
  if (!member) {
    throw new NotFoundError(`Member with ID ${MemberId} not found`);
  }
  return member;
}

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
   * @param {UUID} LineupId - The lineup ID associated with the position.
   * @param {UUID} MemberId - The member ID placed at the position.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Date} [timeOfManualUpdate=new Date()]
   * @returns {Promise<Object>} The created position.
   */
  async create(
    x: number,
    y: number,
    LineupId: string,
    MemberId: string,
    actingUserId: string,
    isAdmin = false,
    timeOfManualUpdate: Date = new Date(),
  ) {
    logger.debug(
      `PositionService create ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        actingUserId,
        isAdmin,
      })}`,
    );

    // Inherit ownerId from parent Lineup → Choreo
    const lineup = await LineupService.findById(
      LineupId,
      actingUserId,
      isAdmin,
    );
    if (!lineup) {
      throw new NotFoundError(`Lineup not found`);
    }
    const choreo = await ChoreoService.findById(
      lineup.ChoreoId,
      actingUserId,
      isAdmin,
    );
    if (!choreo) {
      throw new NotFoundError(`Choreo not found`);
    }
    const ownerId = choreo.UserId;

    await checkWriteAccess(ownerId, actingUserId, isAdmin);
    await assertUsableMember(MemberId);

    return withLineupConflictGuard([lineup.ChoreoId], async () => {
      const transaction = getTransaction();
      const position = await Position.create(
        {
          x,
          y,
          timeOfManualUpdate,
          UserId: ownerId,
          LineupId,
          MemberId,
          creatorId: actingUserId,
          updaterId: actingUserId,
        },
        { transaction },
      );
      await LineupService.touch(LineupId, actingUserId, isAdmin);
      return position;
    });
  }

  /**
   * Find or create a position.
   * @param {number} x - The x-coordinate of the position.
   * @param {number} y - The y-coordinate of the position.
   * @param {UUID} LineupId - The lineup ID associated with the position.
   * @param {UUID} MemberId - The member ID associated with the position.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Date} [timeOfManualUpdate=new Date()]
   * @returns {Promise<Object>} The found or created position.
   */
  async findOrCreate(
    x: number,
    y: number,
    LineupId: string,
    MemberId: string,
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
        actingUserId,
        isAdmin,
      })}`,
    );

    // Inherit ownerId from parent Lineup → Choreo
    const lineup = await LineupService.findById(
      LineupId,
      actingUserId,
      isAdmin,
    );
    if (!lineup) {
      throw new NotFoundError(`Lineup not found`);
    }
    const choreo = await ChoreoService.findById(
      lineup.ChoreoId,
      actingUserId,
      isAdmin,
    );
    if (!choreo) {
      throw new NotFoundError(`Choreo not found`);
    }
    const ownerId = choreo.UserId;

    await checkWriteAccess(ownerId, actingUserId, isAdmin);
    await assertUsableMember(MemberId);

    return withLineupConflictGuard([lineup.ChoreoId], async () => {
      const transaction = getTransaction();
      const [position, created] = await Position.findOrCreate({
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
        transaction,
      });

      if (created) {
        await LineupService.touch(LineupId, actingUserId, isAdmin);
      }

      return position;
    });
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
        : [actingUserId];

    return Position.findAll({
      where:
        accessibleOwnerIds.length > 0
          ? { LineupId, UserId: { [Op.in]: accessibleOwnerIds } }
          : { LineupId, UserId: actingUserId },
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
   * Update a position's coordinates, timestamp, or member.
   *
   * A position cannot be moved to another lineup: a `LineupId`/`lineupId` in
   * `data` that differs from the current lineup is rejected. Reassigning the
   * member is allowed but validated for existence and run under the lineup
   * conflict guard so it cannot create a member conflict or duplicate position.
   * The `timeOfManualUpdate` acts as a last-write-wins guard against stale,
   * out-of-order updates.
   *
   * @param {UUID} id - The ID of the position.
   * @param {string | null} lineupId - If set, the position must belong to this
   * lineup or it is treated as not found (ownership/path filter).
   * @param {Object} data - Fields to update.
   * @param {Date} [data.timeOfManualUpdate] - Client update time; an older value
   * than the stored one is ignored.
   * @param {number} [data.x] - New x-coordinate.
   * @param {number} [data.y] - New y-coordinate.
   * @param {UUID} [data.MemberId] - New member to place; validated and guarded.
   * @param {UUID} [data.LineupId] - Must equal the current lineup if provided.
   * @param {UUID} [data.lineupId] - Lowercase alias of `LineupId`; same rule.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false] - Whether the acting user is an admin.
   * @returns {Promise<Object>} The updated position.
   * @throws {NotFoundError} If the position (optionally scoped to `lineupId`) or
   * a reassigned member is not found.
   * @throws {FaultyInputError} If `data` tries to move the position to another lineup.
   * @throws {RequestOrderError} If `timeOfManualUpdate` is not newer than the stored value.
   * @throws {LineupConflictError} If a member reassignment introduces a conflict.
   */
  async update(
    id: string,
    lineupId: string | null,
    data: {
      timeOfManualUpdate?: Date;
      y?: number;
      x?: number;
      MemberId?: string;
      LineupId?: string;
      lineupId?: string;
    },
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

    const requestedLineupId = data.LineupId ?? data.lineupId;
    if (
      requestedLineupId !== undefined &&
      requestedLineupId !== position.LineupId
    ) {
      throw new FaultyInputError("Positions cannot be moved to another lineup");
    }

    const memberChanged =
      data.MemberId !== undefined && data.MemberId !== position.MemberId;
    if (memberChanged) {
      const member = await assertUsableMember(data.MemberId as string);
      if (member.UserId) {
        await checkReadAccess(member.UserId, actingUserId, isAdmin);
      }
    }

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

    const applyUpdate = async () => {
      const transaction = getTransaction();
      await position.update(
        {
          ...stripProtectedUpdateFields(data),
          updaterId: actingUserId,
        },
        { transaction },
      );
      if (position.LineupId) {
        await LineupService.touch(position.LineupId, actingUserId, isAdmin);
      }
      return position;
    };

    if (!memberChanged || !position.LineupId) {
      return applyUpdate();
    }

    const lineup = await Lineup.findByPk(position.LineupId);
    if (!lineup) {
      return applyUpdate();
    }
    return withLineupConflictGuard([lineup.ChoreoId], applyUpdate);
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

    const lineupId = position.LineupId;
    if (!lineupId) {
      return position.destroy();
    }

    const lineup = await Lineup.findByPk(lineupId);

    return withLineupConflictGuard([lineup?.ChoreoId], async () => {
      const transaction = getTransaction();
      await LineupService.touch(lineupId, actingUserId, isAdmin);
      return position.destroy({ transaction });
    });
  }

  /**
   * Bulk find-or-create positions for a lineup.
   * Performs access checks once, then creates all positions.
   * @param {Array<{x: number, y: number, memberId: string}>} positions - Position data.
   * @param {string} LineupId - The lineup ID.
   * @param {string} actingUserId - The acting user ID.
   * @param {boolean} isAdmin - Whether the acting user is an admin.
   * @returns {Promise<Array>} Array of created or found positions.
   */
  async bulkFindOrCreate(
    positions: Array<{ x: number; y: number; memberId: string }>,
    LineupId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `PositionService bulkFindOrCreate ${JSON.stringify({
        count: positions.length,
        LineupId,
        actingUserId,
        isAdmin,
      })}`,
    );

    // Perform access checks once
    const lineup = await LineupService.findById(
      LineupId,
      actingUserId,
      isAdmin,
    );
    if (!lineup) {
      throw new NotFoundError(`Lineup not found`);
    }
    const choreo = await ChoreoService.findById(
      lineup.ChoreoId,
      actingUserId,
      isAdmin,
    );
    if (!choreo) {
      throw new NotFoundError(`Choreo not found`);
    }
    const ownerId = choreo.UserId;

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const timeOfManualUpdate = new Date();

    return withLineupConflictGuard([lineup.ChoreoId], async () => {
      const transaction = getTransaction();
      const results: Array<typeof Position.prototype> = [];

      for (const pos of positions) {
        const [position, _created] = await Position.findOrCreate({
          where: {
            x: pos.x,
            y: pos.y,
            LineupId,
            MemberId: pos.memberId,
            UserId: ownerId,
          },
          defaults: {
            x: pos.x,
            y: pos.y,
            LineupId,
            MemberId: pos.memberId,
            UserId: ownerId,
            timeOfManualUpdate,
            creatorId: actingUserId,
            updaterId: actingUserId,
          },
          transaction,
        });
        results.push(position);
      }

      // Update lineup timestamp once after all positions
      await LineupService.touch(LineupId, actingUserId, isAdmin);

      return results;
    });
  }

  /**
   * MCP-optimized: Find or create a single position with lightweight access checks.
   * Avoids loading the full Lineup/Choreo object graph.
   */
  async mcpFindOrCreate(
    x: number,
    y: number,
    LineupId: string,
    MemberId: string,
    actingUserId: string,
    isAdmin = false,
    timeOfManualUpdate: Date = new Date(),
  ) {
    logger.debug(
      `PositionService mcpFindOrCreate ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        actingUserId,
        isAdmin,
      })}`,
    );

    const lineup = await Lineup.findByPk(LineupId);
    if (!lineup) {
      throw new NotFoundError(`Lineup not found`);
    }
    const choreo = await Choreo.findByPk(lineup.ChoreoId);
    if (!choreo) {
      throw new NotFoundError(`Choreo not found`);
    }
    await checkWriteAccess(choreo.UserId, actingUserId, isAdmin);

    return withLineupConflictGuard([lineup.ChoreoId], async () => {
      const transaction = getTransaction();
      const [position, created] = await Position.findOrCreate({
        where: { x, y, LineupId, MemberId, UserId: choreo.UserId },
        defaults: {
          x,
          y,
          LineupId,
          MemberId,
          UserId: choreo.UserId,
          timeOfManualUpdate,
          creatorId: actingUserId,
          updaterId: actingUserId,
        },
        transaction,
      });

      if (created) {
        await Lineup.update(
          { updaterId: actingUserId },
          { where: { id: LineupId }, transaction },
        );
      }

      return position;
    });
  }

  /**
   * MCP-optimized: Bulk find-or-create positions with lightweight access checks.
   * Avoids loading the full Lineup/Choreo object graph.
   */
  async mcpBulkFindOrCreate(
    positions: Array<{ x: number; y: number; memberId: string }>,
    LineupId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `PositionService mcpBulkFindOrCreate ${JSON.stringify({
        count: positions.length,
        LineupId,
        actingUserId,
        isAdmin,
      })}`,
    );

    const lineup = await Lineup.findByPk(LineupId);
    if (!lineup) {
      throw new NotFoundError(`Lineup not found`);
    }
    const choreo = await Choreo.findByPk(lineup.ChoreoId);
    if (!choreo) {
      throw new NotFoundError(`Choreo not found`);
    }
    await checkWriteAccess(choreo.UserId, actingUserId, isAdmin);

    const timeOfManualUpdate = new Date();

    return withLineupConflictGuard([lineup.ChoreoId], async () => {
      const transaction = getTransaction();
      const results: Array<typeof Position.prototype> = [];

      for (const pos of positions) {
        const [position, _created] = await Position.findOrCreate({
          where: {
            x: pos.x,
            y: pos.y,
            LineupId,
            MemberId: pos.memberId,
            UserId: choreo.UserId,
          },
          defaults: {
            x: pos.x,
            y: pos.y,
            LineupId,
            MemberId: pos.memberId,
            UserId: choreo.UserId,
            timeOfManualUpdate,
            creatorId: actingUserId,
            updaterId: actingUserId,
          },
          transaction,
        });
        results.push(position);
      }

      await Lineup.update(
        { updaterId: actingUserId },
        { where: { id: LineupId }, transaction },
      );

      return results;
    });
  }

  async migrateCreatorUpdater() {
    logger.debug(`PositionService migrateCreatorUpdater`);

    const positions = await Position.findAll({
      where: { creatorId: { [Op.is]: null }, UserId: { [Op.not]: null } },
    });

    await Promise.all(
      positions.map((position) =>
        position.update({
          creatorId: position.UserId,
          updaterId: position.UserId,
        }),
      ),
    );
  }
}

export default new PositionService();
