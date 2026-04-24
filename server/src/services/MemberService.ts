import { NotFoundError } from "@/utils/errors";
import Member from "../db/models/member";
import SeasonTeam from "../db/models/seasonTeam";
import TeamService from "./TeamService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

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
   * @param {UUID[]} ownerIds - The owner IDs.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {Object} options - Options for fetching members.
   * @param {boolean} options.all - Whether to fetch all members or only those associated with the user.
   * @returns {Promise<Array>} List of members.
   */
  async getAll(
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `MemberService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin, options })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return Member.findAll({
      where: options.all ? {} : { UserId: { [Op.in]: accessibleOwnerIds } },
    });
  }

  /**
   * Find a member by ID.
   * @param {UUID} id - The member ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object|null>} The member object or null if not found.
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `MemberService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const member = await Member.findByPk(id);
    if (!member) {
      return null;
    }

    await checkReadAccess(member.UserId, actingUserId, isAdmin);

    return Member.findOne({ where: { id } }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get the total count of members.
   * @returns {Promise<number>} The count of members.
   */
  getCount() {
    logger.debug(`MemberService getCount`);
    return Member.count();
  }

  /**
   * Get the trend of member creation and deletion.
   * @returns {Promise<number>} The difference between created and deleted members in the last 30 days.
   */
  getTrend() {
    logger.debug(`MemberService getTrend`);
    return Promise.all([
      Member.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      Member.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Create a new member.
   * @param {string} name - The name of the member.
   * @param {string} nickname - The nickname of the member.
   * @param {string | null} abbreviation - The abbreviation for the member.
   * @param {UUID} SeasonTeamId - The season team ID.
   * @param {UUID} ownerId - The owner ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The created member object.
   */
  async create(
    name: string,
    nickname: string,
    abbreviation: string | null,
    SeasonTeamId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    if (!abbreviation)
      abbreviation = name
        .split(" ")
        .map((s) => s.substring(0, 1))
        .join("");

    logger.debug(
      `MemberService create ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        SeasonTeamId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const member = await Member.create({
      name,
      nickname,
      abbreviation,
      SeasonTeamId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    });

    const seasonTeam = await SeasonTeam.findByPk(SeasonTeamId);
    if (seasonTeam) {
      await TeamService.update(seasonTeam.TeamId, {}, actingUserId, isAdmin);
    }

    return member;
  }

  /**
   * Find or create a member.
   * @param {string} name - The name of the member.
   * @param {string | null} nickname - The nickname of the member.
   * @param {string | null} abbreviation - The abbreviation for the member.
   * @param {UUID} SeasonTeamId - The season team ID.
   * @param {UUID} ownerId - The owner ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @returns {Promise<Object>} The found or created member object.
   */
  async findOrCreate(
    name: string,
    nickname: string | null,
    abbreviation: string | null,
    SeasonTeamId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `MemberService findOrCreate ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        SeasonTeamId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const defaultAbbreviation = name
      .split(" ")
      .map((s) => s.substring(0, 1))
      .join("");

    const whereClause: {
      name: string;
      abbreviation: string;
      SeasonTeamId: string;
      UserId: string;
      nickname?: string;
    } = {
      name,
      abbreviation: abbreviation || defaultAbbreviation,
      SeasonTeamId,
      UserId: ownerId,
    };
    if (nickname !== null) {
      whereClause.nickname = nickname;
    }
    const [member, _created] = await Member.findOrCreate({
      where: whereClause,
      defaults: {
        name,
        abbreviation: abbreviation || defaultAbbreviation,
        nickname: nickname ?? undefined,
        SeasonTeamId,
        UserId: ownerId,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    return member;
  }

  /**
   * Update a member.
   * @param {UUID} id - The member ID.
   * @param {Object} data - The data to update.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }] - Options for updating.
   * @param {boolean} [options.all=false] - Whether to update all members.
   * @returns {Promise<Object>} The updated member.
   */
  async update(
    id: string,
    data: object,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `MemberService update ${JSON.stringify({ id, data, actingUserId, isAdmin, options })}`,
    );

    const foundMember = await Member.findByPk(id);
    if (!foundMember) {
      logger.error(`No member found with ID ${id} when updating`);
      throw new NotFoundError(`No member found with ID ${id} when updating`);
    }

    await checkWriteAccess(foundMember.UserId, actingUserId, isAdmin);

    const oldSeasonTeamId = foundMember.SeasonTeamId;

    await foundMember.update({
      ...data,
      updaterId: actingUserId,
    });
    await foundMember.save();

    const seasonTeam = await SeasonTeam.findByPk(
      foundMember.SeasonTeamId || oldSeasonTeamId,
    );
    if (seasonTeam) {
      await TeamService.update(seasonTeam.TeamId, {}, actingUserId, isAdmin);
    }

    return Member.findByPk(id);
  }

  /**
   * Remove a member.
   * @param {UUID} id - The member ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }] - Options for removing members.
   * @param {boolean} [options.all=false] - Whether to remove all members.
   * @returns {Promise<void>} Resolves when the member is removed.
   */
  async remove(
    id: string,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `MemberService remove ${JSON.stringify({ id, actingUserId, isAdmin, options })}`,
    );

    const foundMember = await Member.findByPk(id);
    if (!foundMember) {
      logger.error(`No member found with ID ${id} when deleting`);
      throw new NotFoundError(`No member found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(foundMember.UserId, actingUserId, isAdmin);

    const seasonTeamId = foundMember.SeasonTeamId;
    if (seasonTeamId) {
      const seasonTeam = await SeasonTeam.findByPk(seasonTeamId);
      if (seasonTeam) {
        await TeamService.update(seasonTeam.TeamId, {}, actingUserId, isAdmin);
      }
    }

    return foundMember.destroy();
  }
}

export default new MemberService();
