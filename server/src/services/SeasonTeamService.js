const SeasonTeam = require("../db/models/seasonTeam");
const SeasonService = require("./SeasonService");
const { logger } = require("../plugins/winston");
const MemberService = require("./MemberService");
const { Op } = require("sequelize");

class SeasonTeamService {
  async findById(id, UserId) {
    return SeasonTeam.findOne({
      where: { id, UserId },
      include: ["Choreos", "Members"],
      order: [
        [SeasonTeam.associations.Members, "name"],
        [SeasonTeam.associations.Choreos, "name"],
      ],
    });
  }

  getCount() {
    return SeasonTeam.count();
  }

  getTrend() {
    return Promise.all([
      SeasonTeam.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      SeasonTeam.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  async create(TeamId, SeasonId, memberIds, UserId) {
    logger.debug(
      `SeasonTeamService.create ${JSON.stringify({
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

  async copyMemberIntoSeasonTeam(SeasonTeamId, memberId, UserId) {
    return MemberService.findById(memberId, UserId).then((member) =>
      MemberService.create(
        member.name,
        member.nickname,
        member.abbreviation,
        SeasonTeamId,
        UserId
      )
    );
  }

  async copyMembersIntoSeasonTeam(seasonTeamId, memberIds, UserId) {
    return Promise.all(
      memberIds.map((mId) =>
        this.copyMemberIntoSeasonTeam(seasonTeamId, mId, UserId)
      )
    );
  }

  async remove(id, UserId) {
    return SeasonTeam.findOne({
      where: { id, UserId },
      include: { association: "Season", include: "SeasonTeams" },
    }).then((foundSeasonTeam) => {
      if (foundSeasonTeam) {
        logger.debug(
          `SeasonTeamService.remove ${JSON.stringify({ id, UserId })}`
        );
        if (
          foundSeasonTeam.Season.SeasonTeams.length == 1 &&
          foundSeasonTeam.Season.UserId == UserId
        )
          SeasonService.remove(foundSeasonTeam.Season.id, UserId);
        return foundSeasonTeam.destroy();
      } else {
        throw Error(
          `Beim Löschen wurde kein SeasonTeam mit der ID ${id} gefunden`
        );
      }
    });
  }
}

module.exports = new SeasonTeamService();
