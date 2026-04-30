import { NotFoundError } from "@/utils/errors";
import Member from "../db/models/member";
import SeasonTeam from "../db/models/seasonTeam";
import MemberService from "./MemberService";
import SeasonService from "./SeasonService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { logger } = require("../plugins/winston");
const { Op } = require("sequelize");

/**
 * Service for managing season-team associations.
 * Handles CRUD operations and logic for teams within a season.
 *
 * @class SeasonTeamService
 */
class SeasonTeamService {
  /**
   * Find a season team by ID.
   * @param {UUID} id - The ID of the season team.
   * @param {UUID} actingUserId - The ID of the acting user.
   * @param {boolean} isAdmin - Whether the user is an admin.
   * @returns {Promise<Object>} The season team object.
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `SeasonTeamService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const seasonTeam = await SeasonTeam.findByPk(id);
    if (!seasonTeam) {
      return null;
    }

    await checkReadAccess(seasonTeam.UserId, actingUserId, isAdmin);

    return SeasonTeam.findOne({
      where: { id },
      include: ["Choreos", "Members"],
      order: [
        [SeasonTeam.associations.Members, "name"],
        [SeasonTeam.associations.Choreos, "name"],
      ],
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get all season teams.
   * @param {UUID[]} ownerIds - The IDs of the owners.
   * @param {UUID} actingUserId - The ID of the acting user.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Array>} List of all season teams.
   */
  async getAll(ownerIds: string[], actingUserId: string, isAdmin = false) {
    logger.debug(
      `SeasonTeamService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return SeasonTeam.findAll({
      where: { UserId: { [Op.in]: accessibleOwnerIds } },
      include: ["Season", "Team", "User"],
    });
  }

  /**
   * Get the count of season teams.
   * @returns {Promise<number>} The count of season teams.
   */
  getCount() {
    logger.debug(`SeasonTeamService getCount`);
    return SeasonTeam.count();
  }

  /**
   * Get the trend of season teams created and deleted in the last 30 days.
   * @returns {Promise<number>} The trend value (created - deleted).
   */
  getTrend() {
    logger.debug(`SeasonTeamService getTrend`);
    return Promise.all([
      SeasonTeam.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      SeasonTeam.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Create a new season team and copy members into it.
   * @param {UUID} TeamId - The ID of the team.
   * @param {UUID} SeasonId - The ID of the season.
   * @param {Array<string>} memberIds - List of member IDs to copy.
   * @param {UUID} ownerId - The ID of the owner.
   * @param {UUID} actingUserId - The ID of the acting user.
   * @returns {Promise<Object>} The created season team object.
   */
  async create(
    TeamId: string,
    SeasonId: string,
    memberIds: string[],
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `SeasonTeamService create ${JSON.stringify({
        TeamId,
        SeasonId,
        memberIds,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return SeasonTeam.create({
      TeamId,
      SeasonId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    }).then((seasonTeam) =>
      Promise.all(
        memberIds.map((mId) =>
          this.copyMemberIntoSeasonTeam(
            seasonTeam.id,
            mId,
            ownerId,
            actingUserId,
          ),
        ),
      ).then(() => this.findById(seasonTeam.id, actingUserId, isAdmin)),
    );
  }

  /**
   * Copy a member into a season team.
   * @param {UUID} SeasonTeamId - The ID of the season team.
   * @param {UUID} MemberId - The ID of the member.
   * @param {UUID} ownerId - The ID of the owner.
   * @param {UUID} actingUserId - The ID of the acting user.
   * @returns {Promise<Object>} The created member object.
   */
  async copyMemberIntoSeasonTeam(
    SeasonTeamId: string,
    MemberId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `SeasonTeamService copyMemberIntoSeasonTeam ${JSON.stringify({
        SeasonTeamId,
        MemberId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );
    return MemberService.findById(MemberId, actingUserId, isAdmin).then(
      (member: Member | null) => {
        checkWriteAccess(ownerId, actingUserId, isAdmin);
        return member
          ? MemberService.create(
              member.name,
              member.nickname as string,
              member.abbreviation,
              SeasonTeamId,
              ownerId,
              actingUserId,
              isAdmin,
            )
          : null;
      },
    );
  }

  /**
   * Copy multiple members into a season team.
   * @param {UUID} seasonTeamId - The ID of the season team.
   * @param {Array<string>} memberIds - List of member IDs to copy.
   * @param {UUID} ownerId - The ID of the owner.
   * @param {UUID} actingUserId - The ID of the acting user.
   * @param {boolean} isAdmin - Whether the user is an admin.
   * @returns {Promise<Array>} List of created member objects.
   */
  async copyMembersIntoSeasonTeam(
    seasonTeamId: string,
    memberIds: string[],
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `SeasonTeamService copyMembersIntoSeasonTeam ${JSON.stringify({
        seasonTeamId,
        memberIds,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );
    checkWriteAccess(ownerId, actingUserId, isAdmin);
    return Promise.all(
      memberIds.map((mId) =>
        this.copyMemberIntoSeasonTeam(
          seasonTeamId,
          mId,
          ownerId,
          actingUserId,
          isAdmin,
        ),
      ),
    );
  }

  /**
   * Remove a season team.
   * @param {UUID} id - The season team ID.
   * @param {UUID} actingUserId - The ID of the acting user.
   * @returns {Promise<void>} Resolves when the season team is removed.
   * @throws {Error} Throws an error if the season team is not found.
   */
  async remove(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `SeasonTeamService remove ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const foundSeasonTeam = await SeasonTeam.findByPk(id, {
      include: [{ association: "Season", include: ["SeasonTeams"] }],
    });
    if (!foundSeasonTeam) {
      logger.error(`No seasonTeam found with ID ${id} when deleting`);
      throw new NotFoundError(
        `No seasonTeam found with ID ${id} when deleting`,
      );
    }

    await checkDeleteAccess(foundSeasonTeam.UserId, actingUserId, isAdmin);

    if (
      foundSeasonTeam.Season &&
      foundSeasonTeam.Season.SeasonTeams.length == 1 &&
      foundSeasonTeam.Season.UserId == actingUserId
    )
      SeasonService.remove(foundSeasonTeam.Season.id, actingUserId);
    return foundSeasonTeam.destroy();
  }
}

export default new SeasonTeamService();
