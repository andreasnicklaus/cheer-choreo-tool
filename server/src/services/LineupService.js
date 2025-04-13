const Lineup = require("../db/models/lineup");
const { logger } = require("../plugins/winston");

class LineupService {
  async create(startCount, endCount, ChoreoId, UserId) {
    logger.debug(
      `LineupService.create ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        UserId,
      })}`
    );
    return Lineup.create({ startCount, endCount, ChoreoId, UserId });
  }

  async findOrCreate(startCount, endCount, ChoreoId, UserId) {
    logger.debug(
      `LineupService.findOrCreate ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
        UserId,
      })}`
    );
    const [lineup, created] = await Lineup.findOrCreate({
      where: { startCount, endCount, ChoreoId, UserId },
    });
    return lineup;
  }

  async update(id, data, UserId) {
    return Lineup.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundLineup) => {
        if (Lineup) {
          logger.debug(
            `MemberService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundLineup.update(data);
          await foundLineup.save();
          return Lineup.findOne({
            where: { id, UserId },
            include: [
              {
                association: "Positions",
                include: "Member",
              },
            ],
          }); // njsscan-ignore: node_nosqli_injection
        } else {
          throw Error(
            `Beim Update wurde keine Lineup mit der ID ${id} gefunden`
          );
        }
      });
  }

  async findById(id, UserId) {
    return Lineup.findOne({ where: { id, UserId } }); // njsscan-ignore: node_nosqli_injection
  }

  async findByChoreoId(ChoreoId) {
    return Lineup.findAll({ where: { ChoreoId } });
  }

  async remove(id, UserId) {
    return Lineup.findOne({ where: { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundLineup) => {
        if (foundLineup) {
          logger.debug(
            `LineupService.remove ${JSON.stringify({ id, UserId })}`
          );
          return foundLineup.destroy();
        } else {
          throw Error(
            `Beim Löschen wurde keine Lineup mit der ID ${id} gefunden`
          );
        }
      });
  }
}

module.exports = new LineupService();
