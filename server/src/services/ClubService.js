const Club = require("../db/models/club");
const { logger } = require("../plugins/winston");

class ClubService {
  async getAll() {
    return Club.findAll({ include: { all: true, nested: true } });
  }

  async findById(id) {
    return Club.findByPk(id, { include: { all: true, nested: true } });
  }

  async findByName(name) {
    return Club.findAll({
      where: { name },
      include: [{ association: "Teams", include: "Choreos" }],
    });
  }

  async create(name) {
    logger.debug(`ClubService.create ${JSON.stringify({ name })}`);
    return Club.create({ name });
  }

  async findOrCreate(name) {
    logger.debug(`ClubService.findOrCreate ${JSON.stringify({ name })}`);
    const [club, created] = await Club.findOrCreate({ where: { name } });
    return club;
  }

  async update(id, data) {
    return Club.findByPk(id).then(async (foundClub) => {
      if (foundClub) {
        logger.debug(`ClubService.update ${JSON.stringify({ id, data })}`);
        await foundClub.update(data);
        return foundClub.save();
      } else {
        throw Error(`Beim Update wurde kein Club mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id) {
    return Club.findByPk(id).then((foundClub) => {
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
