const Lineup = require("../db/models/Lineup");
const { logger } = require("../plugins/winston");

class LineupService {
  async create(startCount, endCount, ChoreoId) {
    logger.debug(`LineupService.create ${{ startCount, endCount, ChoreoId }}`);
    return Lineup.create({ startCount, endCount, ChoreoId });
  }
}

module.exports = new LineupService();
