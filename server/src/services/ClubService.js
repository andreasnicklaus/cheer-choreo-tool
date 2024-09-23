const Club = require("../db/models/club");
const { logger } = require("../plugins/winston");

class ClubService {
  async getAll() {
    return Club.findAll({ include: { all: true, nested: true } });
  }

  async findById(id) {
    return Club.findByPk(id, { include: { all: true, nested: true } });
  }

  async create(name) {
    logger.debug(`ClubService.create ${{ name }}`);
    return Club.create({ name });
  }

  async update(id, data) {
    return Club.findByPk(id).then(async (foundClub) => {
      if (foundClub) {
        logger.debug(`ClubService.update ${{ id, data }}`);
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
        logger.debug(`ClubService.remove ${{ id }}`);
        return foundClub.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Club mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new ClubService();
