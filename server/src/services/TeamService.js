const { Op } = require("sequelize");
const Team = require("../db/models/team");
const { logger } = require("../plugins/winston");
const SeasonTeamService = require("./SeasonTeamService");

const defaultInclude = [
  {
    association: "SeasonTeams",
    include: ["Season", "Members"],
  },
];

class TeamService {
  async getAll(UserId, options = { all: false }) {
    return Team.findAll({
      where: options.all ? {} : { UserId },
      include: defaultInclude,
    });
  }

  async findByName(name, UserId) {
    return Team.findAll({
      where: { name, UserId },
      include: defaultInclude,
    });
  }

  async findById(id, UserId) {
    return Team.findOne({
      where: { id, UserId },
      include: defaultInclude,
    });
  }

  getCount() {
    return Team.count();
  }

  getTrend() {
    return Promise.all([
      Team.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Team.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  async create(name, ClubId, SeasonId, UserId) {
    logger.debug(
      `TeamService.create ${JSON.stringify({ name, ClubId, SeasonId, UserId })}`
    );
    return Team.create({ name, ClubId, UserId }).then((team) =>
      SeasonTeamService.create(team.id, SeasonId, [], UserId).then(
        (seasonTeam) => this.findById(team.id, UserId)
      )
    );
  }

  async findOrCreate(name, ClubId, UserId) {
    logger.debug(
      `TeamService.findOrCreate ${JSON.stringify({ name, ClubId, UserId })}`
    );
    const [team, created] = await Team.findOrCreate({
      where: { name, ClubId, UserId },
    });
    return team;
  }

  async update(id, data, UserId, options = { all: false }) {
    return Team.findOne({ where: options.all ? { id } : { id, UserId } }).then(
      async (foundTeam) => {
        if (foundTeam) {
          logger.debug(
            `TeamService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundTeam.update(data);
          return foundTeam.save();
        } else
          throw Error(`Beim Update wurde kein Team mit der ID ${id} gefunden`);
      }
    );
  }

  async remove(id, UserId, options = { all: false }) {
    return Team.findOne({ where: options.all ? { id } : { id, UserId } }).then(
      (foundTeam) => {
        if (foundTeam) {
          logger.debug(`TeamService.remove ${JSON.stringify({ id, UserId })}`);
          return foundTeam.destroy();
        } else {
          throw Error(`Beim Löschen wurde kein Team mit der ID ${id} gefunden`);
        }
      }
    );
  }
}

module.exports = new TeamService();
