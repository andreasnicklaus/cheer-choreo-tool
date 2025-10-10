import Season from "../db/models/season";

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
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for fetching seasons.
   * @param {boolean} options.all - Whether to fetch all seasons.
   * @returns {Promise<Array>} List of seasons.
   */
  async getAll(UserId: string | null, options = { all: false }) {
    logger.debug(`SeasonService getAll ${JSON.stringify({ UserId, options })}`);
    if (UserId)
      return Season.findAll({
        where: options.all
          ? {}
          : { UserId: { [Op.or]: [UserId, { [Op.eq]: null }] } },
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
   * @param {string} name - Name of the season.
   * @param {number} year - Year of the season.
   * @param {string} UserId - User ID associated with the season.
   * @returns {Promise<Object>} Created season object.
   */
  async create(name: string, year: number, UserId: string) {
    logger.debug(
      `SeasonService create ${JSON.stringify({
        name,
        year,
        UserId,
      })}`,
    );
    return Season.create({ name, year, UserId });
  }

  /**
   * Update an existing season.
   * @param {number} id - ID of the season to update.
   * @param {Object} data - Data to update the season with.
   * @param {string} UserId - User ID associated with the season.
   * @param {Object} options - Options for updating the season.
   * @param {boolean} options.all - Whether to update all seasons.
   * @returns {Promise<Object>} Updated season object.
   * @throws Will throw an error if the season is not found.
   */
  async update(
    id: string,
    data: object,
    UserId: string | null,
    options = { all: false },
  ) {
    logger.debug(
      `SeasonService update ${JSON.stringify({ id, data, UserId })}`,
    );
    return Season.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundSeason) => {
        if (foundSeason) {
          await foundSeason.update(data);
          return foundSeason.save();
        } else {
          logger.error(`No season found with ID ${id} when updating`);
          throw new Error(`No season found with ID ${id} when updating`);
        }
      });
  }

  /**
   * Remove a season.
   * @param {number} id - ID of the season to remove.
   * @param {string} UserId - User ID associated with the season.
   * @param {Object} options - Options for removing the season.
   * @param {boolean} options.all - Whether to remove all seasons.
   * @returns {Promise<void>} Resolves when the season is removed.
   * @throws Will throw an error if the season is not found.
   */
  async remove(id: string, UserId: string | null, options = { all: false }) {
    logger.debug(`SeasonService remove ${JSON.stringify({ id, UserId })}`);
    return Season.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundSeason) => {
        if (foundSeason) {
          return foundSeason.destroy();
        } else {
          logger.error(`No season found with ID ${id} when deleting`);
          throw new Error(`No season found with ID ${id} when deleting`);
        }
      });
  }
}

export default new SeasonService();
