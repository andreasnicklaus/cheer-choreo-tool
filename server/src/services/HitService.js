const Hit = require("../db/models/hit");
const { logger } = require("../plugins/winston");
const { Op } = require("sequelize");

class HitService {
  async getAll() {
    return Hit.findAll({ include: "Members" });
  }

  async findById(id) {
    return Hit.findByPk(id, { include: { all: true, nested: true } });
  }

  async findByName(name) {
    return Hit.findAll({
      where: { name },
      include: { all: true, nested: true },
    });
  }

  async create(name, count, ChoreoId, memberIds = []) {
    logger.debug(
      `HitService.create ${JSON.stringify({
        name,
        count,
        ChoreoId,
        memberIds,
      })}`
    );
    return Hit.create({ name, count, ChoreoId }).then(async (hit) => {
      if (memberIds.length > 0) await hit.setMembers(memberIds);
      return Hit.findByPk(hit.id, { include: "Members" });
    });
  }

  async findOrCreate(name, count, ChoreoId, MemberIds = []) {
    logger.debug(
      `HitService.findOrCreate ${JSON.stringify({
        name,
        count,
        ChoreoId,
        MemberIds,
      })}`
    );
    const [hit, created] = await Hit.findOrCreate({
      where: {
        name,
        count,
        ChoreoId,
      },
    });
    await hit.setMembers(MemberIds);
    return hit;
  }

  async update(id, data) {
    return Hit.findByPk(id).then(async (foundHit) => {
      if (foundHit) {
        logger.debug(`HitService.update ${JSON.stringify({ id, data })}`);
        await foundHit.update(data);
        return foundHit.save();
      } else {
        throw Error(`Beim Update wurde kein Hit mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id) {
    return Hit.findByPk(id).then((foundHit) => {
      if (foundHit) {
        logger.debug(`HitService.remove ${JSON.stringify({ id })}`);
        return foundHit.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Hit mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new HitService();
