import Member from "../db/models/member";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");

/**
 * Service for managing member entities and their associations.
 * Handles CRUD operations and member-specific logic.
 *
 * @class MemberService
 */
class MemberService {
  /**
   * Get all members for a user.
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for fetching members.
   * @param {boolean} options.all - Whether to fetch all members or only those associated with the user.
   * @returns {Promise<Array>} List of members.
   */
  async getAll(UserId: string, options = { all: false }) {
    return Member.findAll({ where: options.all ? {} : { UserId } });
  }

  /**
   * Find a member by ID.
   * @param {string} id - The member ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object|null>} The member object or null if not found.
   */
  async findById(id: string, UserId: string) {
    return Member.findOne({ where: { id, UserId } }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get the total count of members.
   * @returns {Promise<number>} The count of members.
   */
  getCount() {
    return Member.count();
  }

  /**
   * Get the trend of member creation and deletion.
   * @returns {Promise<number>} The difference between created and deleted members in the last 30 days.
   */
  getTrend() {
    return Promise.all([
      Member.count({
        where: {
          createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Member.count({
        where: {
          deletedAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Create a new member.
   * @param {string} name - The name of the member.
   * @param {string} nickname - The nickname of the member.
   * @param {string} abbreviation - The abbreviation for the member.
   * @param {string} SeasonTeamId - The season team ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The created member object.
   */
  async create(name: string, nickname: string, abbreviation: string, SeasonTeamId: string, UserId: string) {
    if (!abbreviation)
      abbreviation = name
        .split(" ")
        .map((s) => s.substring(0, 1))
        .join("");

    logger.debug(
      `MemberService.create ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        SeasonTeamId,
        UserId,
      })}`
    );
    return Member.create({
      name,
      nickname,
      abbreviation,
      SeasonTeamId,
      UserId,
    });
  }

  /**
   * Find or create a member.
   * @param {string} name - The name of the member.
   * @param {string} nickname - The nickname of the member.
   * @param {string} abbreviation - The abbreviation for the member.
   * @param {string} SeasonTeamId - The season team ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The found or created member object.
   */
  async findOrCreate(name: string, nickname: string, abbreviation: string, SeasonTeamId: string, UserId: string) {
    logger.debug(
      `MemberService.findOrCreate ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        SeasonTeamId,
        UserId,
      })}`
    );

    const defaultAbbreviation = name
      .split(" ")
      .map((s) => s.substring(0, 1))
      .join("");

    const [member, _created] = await Member.findOrCreate({
      where: {
        name,
        nickname,
        abbreviation: abbreviation || defaultAbbreviation,
        SeasonTeamId,
        UserId,
      },
    });
    return member;
  }

  /**
   * Update a member's information.
   * @param {string} id - The member ID.
   * @param {Object} data - The data to update.
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for updating members.
   * @param {boolean} options.all - Whether to update all members or only those associated with the user.
   * @returns {Promise<Object>} The updated member object.
   */
  async update(id: string, data: object, UserId: string | null, options = { all: false }) {
    return Member.findOne({
      where: options.all || !UserId ? { id } : { id, UserId }
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundMember) => {
        if (foundMember) {
          logger.debug(
            `MemberService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundMember.update(data);
          await foundMember.save();
          return Member.findOne({
            where: options.all
              ? { id }
              : (UserId !== null
                ? { id, UserId }
                : { id })
          }); // njsscan-ignore: node_nosqli_injection
        } else {
          throw Error(
            `Beim Update wurde kein Member mit der ID ${id} gefunden`
          );
        }
      });
  }

  /**
   * Remove a member.
   * @param {string} id - The member ID.
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for removing members.
   * @param {boolean} options.all - Whether to remove all members or only those associated with the user.
   * @returns {Promise<void>} Resolves when the member is removed.
   */
  async remove(id: string, UserId: string | null, options = { all: false }) {
    return Member.findOne({
      where: options.all || !UserId ? { id } : { id, UserId }
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundMember) => {
        if (foundMember) {
          logger.debug(
            `MemberService.remove ${JSON.stringify({ id, UserId })}`
          );
          return foundMember.destroy();
        } else {
          throw Error(
            `Beim Löschen wurde kein Member mit der ID ${id} gefunden`
          );
        }
      });
  }
}

export default new MemberService();
