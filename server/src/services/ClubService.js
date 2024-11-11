const Club = require("../db/models/club");
const Member = require("../db/models/member");
const SeasonTeam = require("../db/models/seasonTeam");
const Team = require("../db/models/team");
const { logger } = require("../plugins/winston");

const defaultInclude = [
  {
    association: "Teams",
    include: {
      association: "SeasonTeams",
      include: ["Choreos", "Season", "Members"],
    },
  },
];

class ClubService {
  async getAll(UserId) {
    return Club.findAll({
      where: { UserId },
      include: defaultInclude,
      order: [
        ["createdAt"],
        [Club.associations.Teams, "name"],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Season,
          "year",
          "DESC NULLS LAST",
        ],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Season,
          "name",
        ],
      ],
    });
  }

  async findById(id, UserId) {
    return Club.findOne({
      where: { id, UserId },
      include: defaultInclude,
      order: [
        [Club.associations.Teams, "name"],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Season,
          "year",
          "DESC NULLS LAST",
        ],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Members,
          "name",
        ],
      ],
    });
  }

  async findByName(name, UserId) {
    return Club.findAll({
      where: { name, UserId },
      include: defaultInclude,
    });
  }

  async create(name, UserId) {
    logger.debug(`ClubService.create ${JSON.stringify({ name, UserId })}`);
    return Club.create({ name, UserId });
  }

  async findOrCreate(name, UserId) {
    logger.debug(
      `ClubService.findOrCreate ${JSON.stringify({ name, UserId })}`
    );
    const [club, created] = await Club.findOrCreate({
      where: { name, UserId },
    });
    return club;
  }

  async update(id, data, UserId) {
    return Club.findOne({ where: { id, UserId } }).then(async (foundClub) => {
      if (foundClub) {
        logger.debug(
          `ClubService.update ${JSON.stringify({ id, data, UserId })}`
        );
        await foundClub.update(data);
        return foundClub.save();
      } else {
        throw Error(`Beim Update wurde kein Club mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id, UserId) {
    return Club.findOne({ where: { id, UserId } }).then((foundClub) => {
      if (foundClub) {
        logger.debug(`ClubService.remove ${JSON.stringify({ id })}`);
        return foundClub.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Club mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new ClubService();
