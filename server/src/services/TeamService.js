const Team = require("../db/models/team");
const { logger } = require("../plugins/winston");

class TeamService {
  async getAll() {
    return Team.findAll({
      include: { all: true },
    });
  }

  async findByName(name) {
    return Team.findAll({
      where: { name },
      include: { all: true, nested: true },
    });
  }

  async findById(id) {
    return Team.findByPk(id, { include: { all: true, nested: true } });
  }

  async create(name, ClubId) {
    logger.debug(`TeamService.create ${JSON.stringify({ name, ClubId })}`);
    return Team.create({ name, ClubId });
  }

  async findOrCreate(name, ClubId) {
    logger.debug(
      `TeamService.findOrCreate ${JSON.stringify({ name, ClubId })}`
    );
    const [team, created] = await Team.findOrCreate({
      where: { name, ClubId },
    });
    return team;
  }

  async update(id, data) {
    return Team.findByPk(id).then(async (foundTeam) => {
      if (foundTeam) {
        logger.debug(`TeamService.update ${JSON.stringify({ id, data })}`);
        await foundTeam.update(data);
        await foundTeam.save();
        return Team.findByPk(id, { include: { all: true, nested: true } });
      } else
        throw Error(`Beim Update wurde kein Team mit der ID ${id} gefunden`);
    });
  }

  async remove(id) {
    return Team.findByPk(id).then((foundTeam) => {
      if (foundTeam) {
        logger.debug(`TeamService.remove ${JSON.stringify({ id })}`);
        return foundTeam.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Team mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new TeamService();
