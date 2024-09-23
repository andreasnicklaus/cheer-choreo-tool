const Team = require("../db/models/team");
const { logger } = require("../plugins/winston");

class TeamService {
  async getAll() {
    return Team.findAll({
      include: { all: true, nested: true },
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
    logger.debug(`TeamService.create ${{ name, ClubId }}`);
    return Team.create({ name, ClubId });
  }

  async update(id, data) {
    return Team.findByPk(id).then(async (foundTeam) => {
      if (foundTeam) {
        logger.debug(`TeamService.update ${{ id, data }}`);
        await foundTeam.update(data);
        return foundTeam.save();
      } else
        throw Error(`Beim Update wurde kein Team mit der ID ${id} gefunden`);
    });
  }

  async remove(id) {
    return Team.findByPk(id).then((foundTeam) => {
      if (foundTeam) {
        logger.debug(`TeamService.remove ${{ id }}`);
        return foundTeam.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Team mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new TeamService();
