const Club = require("../db/models/club");
const { logger } = require("../plugins/winston");

class ClubService {
  async getAll(UserId) {
    return Club.findAll({
      where: { UserId },
      include: [{ association: "Teams", include: "Choreos" }],
    });
  }

  async findById(id, UserId) {
    return Club.findOne({
      where: { id, UserId },
      include: [{ association: "Teams", include: "Choreos" }],
    });
  }

  async findByName(name, UserId) {
    return Club.findAll({
      where: { name, UserId },
      include: [{ association: "Teams", include: "Choreos" }],
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
