const Team = require("../db/models/team");
const { logger } = require("../plugins/winston");

class TeamService {
  async getAll(UserId) {
    return Team.findAll({
      where: { UserId },
      include: { all: true },
    });
  }

  async findByName(name, UserId) {
    return Team.findAll({
      where: { name, UserId },
      include: { all: true, nested: true },
    });
  }

  async findById(id, UserId) {
    return Team.findOne({
      where: { id, UserId },
      include: { all: true, nested: true },
    });
  }

  async create(name, ClubId, UserId) {
    logger.debug(
      `TeamService.create ${JSON.stringify({ name, ClubId, UserId })}`
    );
    return Team.create({ name, ClubId, UserId });
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

  async update(id, data, UserId) {
    return Team.findOne({ where: { id, UserId } }).then(async (foundTeam) => {
      if (foundTeam) {
        logger.debug(
          `TeamService.update ${JSON.stringify({ id, data, UserId })}`
        );
        await foundTeam.update(data);
        await foundTeam.save();
        return Team.findOne({
          where: { id, UserId },
          include: { all: true, nested: true },
        });
      } else
        throw Error(`Beim Update wurde kein Team mit der ID ${id} gefunden`);
    });
  }

  async remove(id, UserId) {
    return Team.findOne({ where: { id, UserId } }).then((foundTeam) => {
      if (foundTeam) {
        logger.debug(`TeamService.remove ${JSON.stringify({ id, UserId })}`);
        return foundTeam.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Team mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new TeamService();
