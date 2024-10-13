const Hit = require("../db/models/hit");
const { logger } = require("../plugins/winston");
const { Op } = require("sequelize");

class HitService {
  async getAll(UserId) {
    return Hit.findAll({ where: { UserId }, include: "Members" });
  }

  async findById(id, UserId) {
    return Hit.findOne({
      where: { id, UserId },
      include: { all: true, nested: true },
    });
  }

  async findByName(name, UserId) {
    return Hit.findAll({
      where: { name, UserId },
      include: { all: true, nested: true },
    });
  }

  async create(name, count, ChoreoId, MemberIds = [], UserId) {
    logger.debug(
      `HitService.create ${JSON.stringify({
        name,
        count,
        ChoreoId,
        MemberIds,
        UserId,
      })}`
    );
    return Hit.create({ name, count, ChoreoId, UserId }).then(async (hit) => {
      if (MemberIds.length > 0) await hit.setMembers(MemberIds);
      return Hit.findByPk(hit.id, { include: "Members" });
    });
  }

  async findOrCreate(name, count, ChoreoId, MemberIds = [], UserId) {
    logger.debug(
      `HitService.findOrCreate ${JSON.stringify({
        name,
        count,
        ChoreoId,
        MemberIds,
        UserId,
      })}`
    );
    const [hit, created] = await Hit.findOrCreate({
      where: {
        name,
        count,
        ChoreoId,
        UserId,
      },
    });
    await hit.setMembers(MemberIds);
    return hit;
  }

  async update(id, data, UserId) {
    return Hit.findOne({ where: { id, UserId } }).then(async (foundHit) => {
      if (foundHit) {
        logger.debug(`HitService.update ${JSON.stringify({ id, data })}`);
        await foundHit.update(data);
        await foundHit.save();
        if (data.MemberIds) await foundHit.setMembers(data.MemberIds);
        return Hit.findOne({
          where: { id, UserId },
          include: "Members",
        });
      } else {
        throw Error(`Beim Update wurde kein Hit mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id, UserId) {
    return Hit.findOne({ where: { id, UserId } }).then((foundHit) => {
      if (foundHit) {
        logger.debug(`HitService.remove ${JSON.stringify({ id, UserId })}`);
        return foundHit.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Hit mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new HitService();
