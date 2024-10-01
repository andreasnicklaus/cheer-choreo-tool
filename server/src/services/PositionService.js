const Position = require("../db/models/position");
const { logger } = require("../plugins/winston");

class PositionService {
  async create(x, y, LineupId, MemberId, UserId) {
    logger.debug(
      `PositionService.create ${JSON.stringify({
        x,
        y,
        LineupId,
        MemberId,
        UserId,
      })}`
    );
    return Position.create({ x, y, LineupId, MemberId, UserId });
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

  async update(positionId, LineupId, data, UserId) {
    return Position.findOne({
      where: { LineupId, positionId, UserId },
      include: "Member",
    }).then(async (foundPosition) => {
      if (foundPosition) {
        logger.debug(
          `PositionService.update ${JSON.stringify({
            positionId,
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
