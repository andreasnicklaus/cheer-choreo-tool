const { Json } = require("sequelize/lib/utils");
const Choreo = require("../db/models/choreo");
const { logger } = require("../plugins/winston");

class ChoreoService {
  async getAll(UserId) {
    return Choreo.findAll({
      where: { UserId },
      include: { all: true, nested: true },
    });
  }

  async findByTeamId(TeamId, UserId) {
    return Choreo.findAll({
      where: { TeamId, UserId },
      include: { all: true, nested: true },
    });
  }

  async findById(id, UserId) {
    return Choreo.findOne({
      where: { UserId, id },
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

  async create(name, counts, TeamId, UserId) {
    logger.debug(
      `ChoreoService.create ${JSON.stringify({ name, counts, TeamId, UserId })}`
    );
    return Choreo.create({ name, counts, TeamId, UserId });
  }

  async findOrCreate(name, counts, TeamId, UserId) {
    logger.debug(
      `ChoreoService.findOrCreate ${JSON.stringify({
        name,
        counts,
        TeamId,
        UserId,
      })}`
    );
    const [choreo, created] = await Choreo.findOrCreate({
      where: { name, counts, TeamId, UserId },
    });
    return choreo;
  }

  async update(id, data, UserId) {
    return Choreo.findOne({ where: { id, UserId } }).then(
      async (foundChoreo) => {
        if (foundChoreo) {
          logger.debug(
            `ChoreoService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundChoreo.update(data);
          await foundChoreo.save();
          return Choreo.findOne({
            where: { id, UserId },
            include: { all: true, nested: true },
          });
        } else {
          throw new Error(
            `Beim Update wurde keine Choreo mit der ID ${id} gefunden`
          );
        }
      }
    );
  }

  async remove(id, UserId) {
    return Choreo.findOne({ where: { id, UserId } }).then(
      async (foundChoreo) => {
        if (foundChoreo) {
          logger.debug(
            `ChoreoService.remove ${JSON.stringify({ id, data, UserId })}`
          );
          return foundChoreo.destroy();
        } else {
          throw new Error(
            `Beim Update wurde keine Choreo mit der ID ${id} gefunden`
          );
        }
      }
    );
  }
}

module.exports = new ChoreoService();
