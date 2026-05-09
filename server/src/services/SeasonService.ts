import { NotFoundError } from "@/utils/errors";
import Season from "../db/models/season";
import {
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");

/**
 * Service for managing season entities and their associations.
 * Handles CRUD operations and season-specific logic.
 *
 * @class SeasonService
 */
class SeasonService {
  /**
   * Get all seasons for a user.
   * @param {string[] | null} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Object} options - Options for fetching seasons.
   * @param {boolean} options.all - Whether to fetch all seasons.
   * @returns {Promise<Array>} List of seasons.
   */
  async getAll(
    ownerIds: string[] | null,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `SeasonService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin, options })}`,
    );

    const accessibleOwnerIds =
      ownerIds && ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    if (accessibleOwnerIds.length > 0)
      return Season.findAll({
        where: options.all
          ? {}
          : {
              UserId: {
                [Op.or]: [{ [Op.in]: accessibleOwnerIds }, { [Op.eq]: null }],
              },
            },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
    else
      return Season.findAll({
        where: options.all ? {} : { UserId: { [Op.is]: null } },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
  }

  /**
   * Get the total count of seasons.
   * @returns {Promise<number>} Count of seasons.
   */
  getCount() {
    logger.debug(`SeasonService getCount`);
    return Season.count();
  }

  /**
   * Get the trend of season creation in the last 30 days.
   * @returns {Promise<number>} Count of seasons created in the last 30 days.
   */
  getTrend() {
    logger.debug(`SeasonService getTrend`);
    return Season.count({
      where: {
        createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
      },
    });
  }

  /**
   * Create a new season.
   *
   * @param {string} name - Name of the season.
   * @param {number} year - Year of the season.
   * @param {UUID|null} ownerId - Owner ID. If null/undefined, falls back to actingUserId
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Object>} Created season object.
   */
  async create(
    name: string,
    year: number,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `SeasonService create ${JSON.stringify({
        name,
        year,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Season.create({
      name,
      year,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    });
  }

  /**
   * Update an existing season.
   * @param {UUID} id - ID of the season to update.
   * @param {Object} data - Data to update the season with.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Object} options - Options for updating the season.
   * @param {boolean} options.all - Whether to update all seasons.
   * @returns {Promise<Object>} Updated season object.
   * @throws Will throw an error if the season is not found.
   */
  async update(
    id: string,
    data: object,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `SeasonService update ${JSON.stringify({ id, data, actingUserId, isAdmin, options })}`,
    );

    const foundSeason = await Season.findByPk(id);
    if (!foundSeason) {
      logger.error(`No season found with ID ${id} when updating`);
      throw new NotFoundError(`No season found with ID ${id} when updating`);
    }

    await checkWriteAccess(foundSeason.UserId, actingUserId, isAdmin);

    await foundSeason.update({
      ...data,
      updaterId: actingUserId,
    });
    return foundSeason.save();
  }

  /**
   * Remove a season.
   * @param {UUID} id - ID of the season to remove.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Object} options - Options for removing the season.
   * @param {boolean} options.all - Whether to remove all seasons.
   * @returns {Promise<void>} Resolves when the season is removed.
   * @throws Will throw an error if the season is not found.
   */
  async remove(
    id: string,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `SeasonService remove ${JSON.stringify({ id, actingUserId, isAdmin, options })}`,
    );

    const foundSeason = await Season.findByPk(id);
    if (!foundSeason) {
      logger.error(`No season found with ID ${id} when deleting`);
      throw new NotFoundError(`No season found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(foundSeason.UserId, actingUserId, isAdmin);

    return foundSeason.destroy();
  }

  async migrateCreatorUpdater() {
    logger.debug(`SeasonService migrateCreatorUpdater`);

    const seasons = await Season.findAll({
      where: { creatorId: { [Op.is]: null }, UserId: { [Op.not]: null } },
    });

    await Promise.all(
      seasons.map((season) =>
        season.update({ creatorId: season.UserId, updaterId: season.UserId }),
      ),
    );
  }
}

export default new SeasonService();
