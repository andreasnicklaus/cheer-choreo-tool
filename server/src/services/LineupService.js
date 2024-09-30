const Lineup = require("../db/models/lineup");
const { logger } = require("../plugins/winston");

class LineupService {
  async create(startCount, endCount, ChoreoId) {
    logger.debug(
      `LineupService.create ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
      })}`
    );
    return Lineup.create({ startCount, endCount, ChoreoId });
  }

  async findOrCreate(startCount, endCount, ChoreoId) {
    logger.debug(
      `LineupService.findOrCreate ${JSON.stringify({
        startCount,
        endCount,
        ChoreoId,
      })}`
    );
    const [lineup, created] = await Lineup.findOrCreate({
      where: { startCount, endCount, ChoreoId },
    });
    return lineup;
  }

  async update(id, data) {
    return Lineup.findByPk(id).then(async (foundLineup) => {
      if (Lineup) {
        logger.debug(`MemberService.update ${JSON.stringify({ id, data })}`);
        await foundLineup.update(data);
        await foundLineup.save();
        return Lineup.findByPk(id, {
          include: [
            {
              association: "Positions",
              include: "Member",
            },
          ],
        });
      } else {
        throw Error(`Beim Update wurde keine Lineup mit der ID ${id} gefunden`);
      }
    });
  }

  async findById(id) {
    return Lineup.findByPk(id);
  }

  async remove(id) {
    return Lineup.findByPk(id).then((foundLineup) => {
      if (foundLineup) {
        logger.debug(`LineupService.remove ${JSON.stringify({ id })}`);
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
