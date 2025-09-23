import Member from "../db/models/member";
import SeasonTeam from "../db/models/seasonTeam";

const SeasonService = require("./SeasonService");
const { logger } = require("../plugins/winston");
const MemberService = require("./MemberService");
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
   * @param {string} id - The ID of the season team.
   * @param {string} UserId - The ID of the user.
   * @returns {Promise<Object>} The season team object.
   */
  async findById(id: string, UserId: string) {
    logger.debug(
      `SeasonTeamService findById ${JSON.stringify({ id, UserId })}`
    );
    return SeasonTeam.findOne({
      where: { id, UserId },
      include: ["Choreos", "Members"],
      order: [
        [SeasonTeam.associations.Members, "name"],
        [SeasonTeam.associations.Choreos, "name"],
      ],
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get all season teams.
   * @returns {Promise<Array>} List of all season teams.
   */
  getAll() {
    logger.debug(`SeasonTeamService getAll`);
    return SeasonTeam.findAll({
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
   * @param {string} TeamId - The ID of the team.
   * @param {string} SeasonId - The ID of the season.
   * @param {Array<string>} memberIds - List of member IDs to copy.
   * @param {string} UserId - The ID of the user.
   * @returns {Promise<Object>} The created season team object.
   */
  async create(
    TeamId: string,
    SeasonId: string,
    memberIds: string[],
    UserId: string
  ) {
    logger.debug(
      `SeasonTeamService create ${JSON.stringify({
        TeamId,
        SeasonId,
        memberIds,
        UserId,
      })}`
    );
    return SeasonTeam.create({ TeamId, SeasonId, UserId }).then((seasonTeam) =>
      Promise.all(
        memberIds.map((mId) =>
          this.copyMemberIntoSeasonTeam(seasonTeam.id, mId, UserId)
        )
      ).then(() => this.findById(seasonTeam.id, UserId))
    );
  }

  /**
   * Copy a member into a season team.
   * @param {string} SeasonTeamId - The ID of the season team.
   * @param {string} MemberId - The ID of the member.
   * @param {string} UserId - The ID of the user.
   * @returns {Promise<Object>} The created member object.
   */
  async copyMemberIntoSeasonTeam(
    SeasonTeamId: string,
    MemberId: string,
    UserId: string
  ) {
    logger.debug(
      `SeasonTeamService copyMemberIntoSeasonTeam ${JSON.stringify({
        SeasonTeamId,
        MemberId,
        UserId,
      })}`
    );
    return MemberService.findById(MemberId, UserId).then((member: Member) =>
      MemberService.create(
        member.name,
        member.nickname,
        member.abbreviation,
        SeasonTeamId,
        UserId
      )
    );
  }

  /**
   * Copy multiple members into a season team.
   * @param {string} seasonTeamId - The ID of the season team.
   * @param {Array<string>} memberIds - List of member IDs to copy.
   * @param {string} UserId - The ID of the user.
   * @returns {Promise<Array>} List of created member objects.
   */
  async copyMembersIntoSeasonTeam(
    seasonTeamId: string,
    memberIds: string[],
    UserId: string
  ) {
    logger.debug(
      `SeasonTeamService copyMembersIntoSeasonTeam ${JSON.stringify({
        seasonTeamId,
        memberIds,
        UserId,
      })}`
    );
    return Promise.all(
      memberIds.map((mId) =>
        this.copyMemberIntoSeasonTeam(seasonTeamId, mId, UserId)
      )
    );
  }

  /**
   * Remove a season team by ID.
   * @param {string} id - The ID of the season team.
   * @param {string} UserId - The ID of the user.
   * @returns {Promise<void>} Resolves when the season team is removed.
   * @throws {Error} Throws an error if the season team is not found.
   */
  async remove(id: string, UserId: string) {
    logger.debug(`SeasonTeamService remove ${JSON.stringify({ id, UserId })}`);
    return SeasonTeam.findOne({
      where: { id, UserId },
      include: [
        {
          association: "Season",
          include: [{ association: "SeasonTeams" }],
        },
      ],
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundSeasonTeam) => {
        if (foundSeasonTeam) {
          if (
            foundSeasonTeam.Season.SeasonTeams.length == 1 &&
            foundSeasonTeam.Season.UserId == UserId
          )
            SeasonService.remove(foundSeasonTeam.Season.id, UserId);
          return foundSeasonTeam.destroy();
        } else {
          logger.error(`No seasonTeam found with ID ${id} when deleting`);
          throw new Error(`No seasonTeam found with ID ${id} when deleting`);
        }
      });
  }
}

export default new SeasonTeamService();
