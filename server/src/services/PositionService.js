const Position = require("../db/models/position");
const { logger } = require("../plugins/winston");

class PositionService {
  async create(x, y, UserId) {
    logger.debug(
      `PositionService.create ${JSON.stringify({
        x,
        y,
        UserId,
      })}`
    );
    return Position.create({ x, y, UserId });
  }

  async findOrCreate(x, y, LineupId, MemberId, UserId) {
    logger.debug(
      `PositionService.findOrCreate ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        UserId,
      })}`
    );
    const [position, created] = await Position.findOrCreate({
      where: { x, y, LineupId, MemberId, UserId },
    });
    return position;
  }

  async findById(id, UserId) {
    return Position.findOne({ where: { id, UserId }, include: "Member" });
  }

  async update(id, LineupId, data, UserId) {
    return Position.findOne({
      where: { LineupId, id, UserId },
      include: "Member",
    }).then(async (foundPosition) => {
      if (foundPosition) {
        logger.debug(
          `PositionService.update ${JSON.stringify({
            id,
            data,
            UserId,
          })}`
        );
        await foundPosition.update(data);
        return foundPosition.save();
      } else
        throw Error(
          `Beim Update wurde keine Position mit der ID ${id} gefunden`
        );
    });
  }

  async remove(id, UserId) {
    return Position.findOne({ where: { id, UserId } }).then((foundPosition) => {
      if (foundPosition) {
        logger.debug(
          `PositionService.remove ${JSON.stringify({ id, UserId })}`
        );
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
