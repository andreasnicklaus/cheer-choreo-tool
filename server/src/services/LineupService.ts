import Lineup from "../db/models/lineup";

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
   * @param {string} ChoreoId - The choreography ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The created lineup.
   */
  async create(startCount: number, endCount: number, ChoreoId: string, UserId: string) {
    logger.debug(
      `LineupService.create ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        UserId,
      })}`
    );
    return Lineup.create({ startCount, endCount, ChoreoId, UserId });
  }

  /**
   * Find or create a lineup.
   * @param {number} startCount - The start count of the lineup.
   * @param {number} endCount - The end count of the lineup.
   * @param {string} ChoreoId - The choreography ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The found or created lineup.
   */
  async findOrCreate(startCount: number, endCount: number, ChoreoId: string, UserId: string) {
    logger.debug(
      `LineupService.findOrCreate ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        UserId,
      })}`
    );
    const [lineup, _created] = await Lineup.findOrCreate({
      where: { startCount, endCount, ChoreoId, UserId },
    });
    return lineup;
  }

  /**
   * Update a lineup.
   * @param {string} id - The lineup ID.
   * @param {Object} data - The data to update.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The updated lineup.
   */
  async update(id: string, data: object, UserId: string) {
    return Lineup.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundLineup: Lineup | null) => {
        if (foundLineup) {
          logger.debug(
            `MemberService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundLineup.update(data);
          await foundLineup.save();
          return Lineup.findOne({
            where: { id, UserId },
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
        } else {
          throw Error(
            `Beim Update wurde keine Lineup mit der ID ${id} gefunden`
          );
        }
      });
  }

  /**
   * Find a lineup by ID.
   * @param {string} id - The lineup ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The found lineup.
   */
  async findById(id: string, UserId: string) {
    return Lineup.findOne({ where: { id, UserId } }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get all lineups for a choreography.
   * @param {string} ChoreoId - The choreography ID.
   * @returns {Promise<Array>} List of lineups.
   */
  async findByChoreoId(ChoreoId: string) {
    return Lineup.findAll({ where: { ChoreoId } });
  }

  /**
   * Remove a lineup.
   * @param {string} id - The lineup ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<void>} Resolves when the lineup is removed.
   */
  async remove(id: string, UserId: string) {
    return Lineup.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundLineup: Lineup | null) => {
        if (foundLineup) {
          logger.debug(
            `LineupService.remove ${JSON.stringify({ id, UserId })}`
          );
          return foundLineup.destroy();
        } else {
          throw Error(
            `Beim Löschen wurde keine Lineup mit der ID ${id} gefunden`
          );
        }
      });
  }
}

export default new LineupService();
