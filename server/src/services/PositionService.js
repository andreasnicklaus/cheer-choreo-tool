const Position = require("../db/models/position");
const { logger } = require("../plugins/winston");

class PositionService {
  async create(x, y, LineupId, MemberId) {
    logger.debug(
      `PositionService.create ${JSON.stringify({ x, y, LineupId, MemberId })}`
    );
    return Position.create({ x, y, LineupId, MemberId });
  }

  async findOrCreate(x, y, LineupId, MemberId) {
    logger.debug(
      `PositionService.findOrCreate ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
      })}`
    );
    const [position, created] = await Position.findOrCreate({
      where: { x, y, LineupId, MemberId },
    });
    return position;
  }

  async findById(id) {
    return Position.findByPk(id, { include: "Member" });
  }

  async update(positionId, LineupId, data) {
    return Position.findByPk(positionId, {
      where: { LineupId },
      include: "Member",
    }).then(async (foundPosition) => {
      if (foundPosition) {
        logger.debug(
          `PositionService.update ${JSON.stringify({ positionId, data })}`
        );
        await foundPosition.update(data);
        return foundPosition.save();
      } else
        throw Error(
          `Beim Update wurde keine Position mit der ID ${id} gefunden`
        );
    });
  }
  async remove(id) {
    return Position.findByPk(id).then((foundPosition) => {
      if (foundPosition) {
        logger.debug(`PositionService.remove ${JSON.stringify({ id })}`);
        return foundPosition.destroy();
      } else {
        throw Error(
          `Beim Löschen wurde keine Position mit der ID ${id} gefunden`
        );
      }
    });
  }
}

module.exports = new PositionService();
