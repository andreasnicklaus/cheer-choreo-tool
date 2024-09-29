const { Json } = require("sequelize/lib/utils");
const Choreo = require("../db/models/choreo");
const { logger } = require("../plugins/winston");

class ChoreoService {
  async getAll() {
    return Choreo.findAll({
      include: { all: true, nested: true },
    });
  }

  async findByTeamId(teamId) {
    return Choreo.findAll({
      where: { teamId },
      include: { all: true, nested: true },
    });
  }

  async findById(id) {
    // return Choreo.findByPk(id, { include: { all: true, nested: false } });
    return Choreo.findByPk(id, {
      include: [
        {
          association: "Team",
          include: "Members",
        },
        {
          association: "Lineups",
          include: {
            association: "Positions",
            include: "Member",
          },
        },
        "Hits",
      ],
    });
  }

  async create(name, counts, TeamId) {
    logger.debug(
      `ChoreoService.create ${JSON.stringify({ name, counts, TeamId })}`
    );
    return Choreo.create({ name, counts, TeamId });
  }

  async findOrCreate(name, counts, TeamId) {
    logger.debug(
      `ChoreoService.findOrCreate ${JSON.stringify({ name, counts, TeamId })}`
    );
    const [choreo, created] = await Choreo.findOrCreate({
      where: { name, counts, TeamId },
    });
    return choreo;
  }

  async update(id, data) {
    return Choreo.findByPk(id).then(async (foundChoreo) => {
      if (foundChoreo) {
        logger.debug(`ChoreoService.update ${JSON.stringify({ id, data })}`);
        await foundChoreo.update(data);
        await foundChoreo.save();
        return Choreo.findByPk(id, { include: { all: true, nested: true } });
      } else {
        throw new Error(
          `Beim Update wurde keine Choreo mit der ID ${id} gefunden`
        );
      }
    });
  }

  async remove(id) {
    return Choreo.findByPk(id).then(async (foundChoreo) => {
      if (foundChoreo) {
        logger.debug(`ChoreoService.remove ${JSON.stringify({ id, data })}`);
        return foundChoreo.destroy();
      } else {
        throw new Error(
          `Beim Update wurde keine Choreo mit der ID ${id} gefunden`
        );
      }
    });
  }
}

module.exports = new ChoreoService();
