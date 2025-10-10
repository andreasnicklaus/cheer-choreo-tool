import Hit from "../db/models/hit";

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
  async getAll(UserId: string) {
    logger.debug(`HitService getAll ${JSON.stringify({ UserId })}`);
    return Hit.findAll({ where: { UserId }, include: "Members" });
  }

  /**
   * Find a Hit by its ID and user, including all associations.
   * @async
   * @param {string} id - The Hit's ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit|null>} The found Hit or null.
   */
  async findById(id: string, UserId: string) {
    logger.debug(`HitService findById ${JSON.stringify({ id, UserId })}`);
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
  async findByName(name: string, UserId: string) {
    logger.debug(`HitService findByName ${JSON.stringify({ name, UserId })}`);
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
   * @param {Array<string>} [memberIds=[]] - Array of member IDs.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit>} The created Hit with members.
   */
  async create(
    name: string,
    count: number,
    ChoreoId: string,
    memberIds: Array<string> = [],
    UserId: string,
  ) {
    logger.debug(
      `HitService create ${JSON.stringify({
        name,
        count,
        ChoreoId,
        memberIds,
        UserId,
      })}`,
    );
    return Hit.create({ name, count, ChoreoId, UserId }).then(
      async (hit: Hit) => {
        if (memberIds.length > 0) await hit.setMembers(memberIds);
        return Hit.findByPk(hit.id, { include: "Members" });
      },
    );
  }

  /**
   * Find or create a Hit by name, count, and choreography, and associate members.
   * @async
   * @param {string} name - The Hit's name.
   * @param {number} count - The count value.
   * @param {string} ChoreoId - The choreography ID.
   * @param {Array<string>} [memberIds=[]] - Array of member IDs.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Hit>} The found or created Hit.
   */
  async findOrCreate(
    name: string,
    count: number,
    ChoreoId: string,
    memberIds: string[] = [],
    UserId: string,
  ) {
    logger.debug(
      `HitService findOrCreate ${JSON.stringify({
        name,
        count,
        ChoreoId,
        memberIds,
        UserId,
      })}`,
    );
    const [hit, _created] = await Hit.findOrCreate({
      where: {
        name,
        count,
        ChoreoId,
        UserId,
      },
    });
    await hit.setMembers(memberIds);
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
  async update(
    id: string,
    data: Hit & { memberIds: string[] },
    UserId: string,
  ) {
    logger.debug(`HitService update ${JSON.stringify({ id, data, UserId })}`);
    return Hit.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundHit: Hit | null) => {
        if (foundHit) {
          await foundHit.update(data);
          await foundHit.save();
          if (data.memberIds) await foundHit.setMembers(data.memberIds);
          return Hit.findOne({
            where: { id, UserId },
            include: "Members",
          }); // njsscan-ignore: node_nosqli_injection
        } else {
          logger.error(`No hit found with ID ${id} when updating`);
          throw new Error(`No hit found with ID ${id} when updating`);
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
  async remove(id: string, UserId: string) {
    logger.debug(`HitService remove ${JSON.stringify({ id, UserId })}`);
    return Hit.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundHit: Hit | null) => {
        if (foundHit) {
          return foundHit.destroy();
        } else {
          logger.error(`No hit found with ID ${id} when deleting`);
          throw new Error(`No hit found with ID ${id} when deleting`);
        }
      });
  }
}

export default new HitService();
