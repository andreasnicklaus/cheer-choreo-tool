const Position = require("../db/models/position");
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
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<Object>} The created position.
   */
  async create(x, y, UserId) {
    logger.debug(
      `PositionService.create ${JSON.stringify({
        x,
        y,
        UserId,
      })}`
    );
    return Position.create({ x, y, UserId });
  }

  /**
   * Find or create a position.
   * @param {number} x - The x-coordinate of the position.
   * @param {number} y - The y-coordinate of the position.
   * @param {string} LineupId - The lineup ID associated with the position.
   * @param {string} MemberId - The member ID associated with the position.
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<Object>} The found or created position.
   */
  async findOrCreate(x, y, LineupId, MemberId, UserId) {
    logger.debug(
      `PositionService.findOrCreate ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        UserId,
      })}`
    );
    const [position, created] = await Position.findOrCreate({
      where: { x, y, LineupId, MemberId, UserId },
    });
    return position;
  }

  /**
   * Get all positions for a lineup.
   * @param {string} LineupId - The lineup ID.
   * @param {string} UserId - The user ID associated with the positions.
   * @returns {Promise<Array>} List of positions.
   */
  async findByLineupId(LineupId, UserId) {
    return Position.findAll({ where: { LineupId, UserId }, include: "Member" });
  }

  /**
   * Find a position by ID.
   * @param {string} id - The ID of the position.
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<Object|null>} The found position or null if not found.
   */
  async findById(id, UserId) {
    return Position.findOne({ where: { id, UserId }, include: "Member" }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Update a position.
   * @param {string} id - The ID of the position.
   * @param {string} LineupId - The lineup ID associated with the position.
   * @param {Object} data - The data to update the position with.
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<Object>} The updated position.
   * @throws Will throw an error if the position is not found.
   */
  async update(id, LineupId, data, UserId) {
    return Position.findOne({
      where: { LineupId, id, UserId },
      include: "Member",
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundPosition) => {
        if (foundPosition) {
          logger.debug(
            `PositionService.update ${JSON.stringify({
              id,
              data,
              UserId,
            })}`
          );
          await foundPosition.update(data);
          return foundPosition.save();
        } else
          throw Error(
            `Beim Update wurde keine Position mit der ID ${id} gefunden`
          );
      });
  }

  /**
   * Remove a position.
   * @param {string} id - The ID of the position.
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<void>} Resolves when the position is removed.
   * @throws Will throw an error if the position is not found.
   */
  async remove(id, UserId) {
    return Position.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundPosition) => {
        if (foundPosition) {
          logger.debug(
            `PositionService.remove ${JSON.stringify({ id, UserId })}`
          );
          return foundPosition.destroy();
        } else {
          throw Error(
            `Beim Löschen wurde keine Position mit der ID ${id} gefunden`
          );
        }
      });
  }
}

module.exports = new PositionService();
