const { Op } = require("sequelize");
const Season = require("../db/models/season");
const { logger } = require("../plugins/winston");

class SeasonService {
  async getAll(UserId, options = { all: false }) {
    if (UserId)
      return Season.findAll({
        where: options.all
          ? {}
          : { UserId: { [Op.or]: [UserId, { [Op.eq]: null }] } },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
    else
      return Season.findAll({
        where: options.all ? {} : { UserId: null },
        order: [["year", "DESC NULLS LAST"], "createdAt"],
      });
  }

  getCount() {
    return Season.count();
  }

  getTrend() {
    return Season.count({
      where: {
        createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
      },
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

  async update(id, data, UserId, options = { all: false }) {
    return Season.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundSeason) => {
        if (foundSeason) {
          logger.debug(
            `SeasonService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundSeason.update(data);
          return foundSeason.save();
        } else {
          throw Error(
            `Beim Update wurde keine Season mit der ID ${id} gefunden`
          );
        }
      });
  }

  async remove(id, UserId, options = { all: false }) {
    return Season.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundSeason) => {
        if (foundSeason) {
          logger.debug(
            `SeasonService.remove ${JSON.stringify({ id, UserId })}`
          );
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
