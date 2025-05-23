const Hit = require("../db/models/hit");
const { logger } = require("../plugins/winston");

/**
 * Service for managing Hit entities and their associations.
 * Handles CRUD operations and member associations for Hits.
 *
 * @class HitService
 */
class HitService {
  /**
   * Get all Hits for a user, including their members.
   * @async
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Array<Hit>>} List of Hit objects.
   */
  async getAll(UserId) {
    return Hit.findAll({ where: { UserId }, include: "Members" });
  }

  /**
   * Find a Hit by its ID and user, including all associations.
   * @async
   * @param {string} id - The Hit's ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit|null>} The found Hit or null.
   */
  async findById(id, UserId) {
    return Hit.findOne({
      where: { id, UserId },
      include: { all: true, nested: true },
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Find all Hits by name for a user, including all associations.
   * @async
   * @param {string} name - The Hit's name.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Array<Hit>>} List of matching Hits.
   */
  async findByName(name, UserId) {
    return Hit.findAll({
      where: { name, UserId },
      include: { all: true, nested: true },
    });
  }

  /**
   * Create a new Hit and associate members if provided.
   * @async
   * @param {string} name - The Hit's name.
   * @param {number} count - The count value.
   * @param {string} ChoreoId - The choreography ID.
   * @param {Array<string>} [MemberIds=[]] - Array of member IDs.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit>} The created Hit with members.
   */
  async create(name, count, ChoreoId, MemberIds = [], UserId) {
    logger.debug(
      `HitService.create ${JSON.stringify({
        name,
        count,
        ChoreoId,
        MemberIds,
        UserId,
      })}`
    );
    return Hit.create({ name, count, ChoreoId, UserId }).then(async (hit) => {
      if (MemberIds.length > 0) await hit.setMembers(MemberIds);
      return Hit.findByPk(hit.id, { include: "Members" });
    });
  }

  /**
   * Find or create a Hit by name, count, and choreography, and associate members.
   * @async
   * @param {string} name - The Hit's name.
   * @param {number} count - The count value.
   * @param {string} ChoreoId - The choreography ID.
   * @param {Array<string>} [MemberIds=[]] - Array of member IDs.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit>} The found or created Hit.
   */
  async findOrCreate(name, count, ChoreoId, MemberIds = [], UserId) {
    logger.debug(
      `HitService.findOrCreate ${JSON.stringify({
        name,
        count,
        ChoreoId,
        MemberIds,
        UserId,
      })}`
    );
    const [hit, created] = await Hit.findOrCreate({
      where: {
        name,
        count,
        ChoreoId,
        UserId,
      },
    });
    await hit.setMembers(MemberIds);
    return hit;
  }

  /**
   * Update a Hit by ID and user, and update member associations if provided.
   * @async
   * @param {string} id - The Hit's ID.
   * @param {Object} data - The update data.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit>} The updated Hit.
   */
  async update(id, data, UserId) {
    return Hit.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundHit) => {
        if (foundHit) {
          logger.debug(`HitService.update ${JSON.stringify({ id, data })}`);
          await foundHit.update(data);
          await foundHit.save();
          if (data.MemberIds) await foundHit.setMembers(data.MemberIds);
          return Hit.findOne({
            where: { id, UserId },
            include: "Members",
          }); // njsscan-ignore: node_nosqli_injection
        } else {
          throw Error(`Beim Update wurde kein Hit mit der ID ${id} gefunden`);
        }
      });
  }

  /**
   * Remove a Hit by ID and user.
   * @async
   * @param {string} id - The Hit's ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<void>} Resolves if deletion is successful.
   */
  async remove(id, UserId) {
    return Hit.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundHit) => {
        if (foundHit) {
          logger.debug(`HitService.remove ${JSON.stringify({ id, UserId })}`);
          return foundHit.destroy();
        } else {
          throw Error(`Beim Löschen wurde kein Hit mit der ID ${id} gefunden`);
        }
      });
  }
}

module.exports = new HitService();
