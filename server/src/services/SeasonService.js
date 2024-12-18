const { Op } = require("sequelize");
const Season = require("../db/models/season");
const { logger } = require("../plugins/winston");

class SeasonService {
  async getAll(UserId) {
    if (UserId)
      return Season.findAll({
        where: { UserId: { [Op.or]: [UserId, { [Op.eq]: null }] } },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
    else
      return Season.findAll({
        where: { UserId: null },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
  }

  async create(name, year, UserId) {
    logger.debug(
      `SeasonService.create ${JSON.stringify({
        name,
        year,
        UserId,
      })}`
    );
    return Season.create({ name, year, UserId });
  }

  async remove(id, UserId) {
    return Season.findOne({
      where: { id, UserId },
    }).then((foundSeason) => {
      if (foundSeason) {
        logger.debug(`SeasonService.remove ${JSON.stringify({ id, UserId })}`);
        return foundSeason.destroy();
      } else {
        throw Error(
          `Beim Löschen wurde keine Season mit der ID ${id} gefunden`
        );
      }
    });
  }
}

module.exports = new SeasonService();
