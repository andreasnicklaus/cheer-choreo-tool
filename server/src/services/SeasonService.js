const { Op } = require("sequelize");
const Season = require("../db/models/season");
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
  async getAll(UserId, options = { all: false }) {
    if (UserId)
      return Season.findAll({
        where: options.all
          ? {}
          : { UserId: { [Op.or]: [UserId, { [Op.eq]: null }] } },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
    else
      return Season.findAll({
        where: options.all ? {} : { UserId: null },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
  }

  /**
   * Get the total count of seasons.
   * @returns {Promise<number>} Count of seasons.
   */
  getCount() {
    return Season.count();
  }

  /**
   * Get the trend of season creation in the last 30 days.
   * @returns {Promise<number>} Count of seasons created in the last 30 days.
   */
  getTrend() {
    return Season.count({
      where: {
        createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
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
  async create(name, year, UserId) {
    logger.debug(
      `SeasonService.create ${JSON.stringify({
        name,
        year,
        UserId,
      })}`
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
  async update(id, data, UserId, options = { all: false }) {
    return Season.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundSeason) => {
        if (foundSeason) {
          logger.debug(
            `SeasonService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundSeason.update(data);
          return foundSeason.save();
        } else {
          throw Error(
            `Beim Update wurde keine Season mit der ID ${id} gefunden`
          );
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
  async remove(id, UserId, options = { all: false }) {
    return Season.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundSeason) => {
        if (foundSeason) {
          logger.debug(
            `SeasonService.remove ${JSON.stringify({ id, UserId })}`
          );
          return foundSeason.destroy();
        } else {
          throw Error(
            `Beim Löschen wurde keine Season mit der ID ${id} gefunden`
          );
        }
      });
  }
}

module.exports = new SeasonService();
