import { NotFoundError, RequestOrderError } from './../utils/errors';
import Position from "../db/models/position";

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
  async create(x: number, y: number, UserId: string, timeOfManualUpdate: Date = new Date()) {
    logger.debug(
      `PositionService create ${JSON.stringify({
        x,
        y,
        UserId,
      })}`,
    );
    return Position.create({ x, y, timeOfManualUpdate, UserId });
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
  async findOrCreate(
    x: number,
    y: number,
    LineupId: string,
    MemberId: string,
    UserId: string,
    timeOfManualUpdate: Date = new Date()
  ) {
    logger.debug(
      `PositionService findOrCreate ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        UserId,
      })}`,
    );
    const [position, _created] = await Position.findOrCreate({
      where: { x, y, LineupId, MemberId, UserId },
      defaults: { x, y, LineupId, MemberId, UserId, timeOfManualUpdate }
    });
    return position;
  }

  /**
   * Get all positions for a lineup.
   * @param {string} LineupId - The lineup ID.
   * @param {string} UserId - The user ID associated with the positions.
   * @returns {Promise<Array>} List of positions.
   */
  async findByLineupId(LineupId: string, UserId: string | null) {
    logger.debug(`PositionService  ${JSON.stringify({ LineupId, UserId })}`);
    return Position.findAll({
      where: UserId ? { LineupId, UserId } : { LineupId },
      include: "Member",
    });
  }

  /**
   * Find a position by ID.
   * @param {string} id - The ID of the position.
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<Object|null>} The found position or null if not found.
   */
  async findById(id: string, UserId: string) {
    logger.debug(`PositionService findById ${JSON.stringify({ id, UserId })}`);
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
  async update(
    id: string,
    LineupId: string | null,
    data: { timeOfManualUpdate?: Date, y?: number, x?: number },
    UserId: string,
  ) {
    logger.debug(
      `PositionService update ${JSON.stringify({
        id,
        data,
        UserId,
      })}`,
    );
    return Position.findOne({
      where: LineupId ? { LineupId, id, UserId } : { id, UserId },
      include: "Member",
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundPosition) => {
        if (foundPosition) {
          if (data.timeOfManualUpdate) {
            if (foundPosition.timeOfManualUpdate && new Date(data.timeOfManualUpdate) <= foundPosition.timeOfManualUpdate) {
              throw new RequestOrderError(`Ignoring update to position ${id} as timeOfManualUpdate is not more recent`);
            }
          }
          else (data.timeOfManualUpdate = new Date());
          await foundPosition.update(data);
          return foundPosition.save();
        } else {
          logger.error(`No position found with ID ${id} when updating`);
          throw new NotFoundError(`No position found with ID ${id} when updating`);
        }
      });
  }

  /**
   * Remove a position.
   * @param {string} id - The ID of the position.
   * @param {string} UserId - The user ID associated with the position.
   * @returns {Promise<void>} Resolves when the position is removed.
   * @throws Will throw an error if the position is not found.
   */
  async remove(id: string, UserId: string) {
    logger.debug(`PositionService remove ${JSON.stringify({ id, UserId })}`);
    return Position.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundPosition) => {
        if (foundPosition) {
          return foundPosition.destroy();
        } else {
          logger.error(`No position found with ID ${id} when deleting`);
          throw new NotFoundError(`No position found with ID ${id} when deleting`);
        }
      });
  }
}

export default new PositionService();
