const Choreo = require("../db/models/choreo");
const { logger } = require("../plugins/winston");

// const choreos = [
//   {
//     id: "blush-rm2023",
//     teamId: "blush",
//     name: "RM 2023",
//     counts: 200,
//     actions: [
//       {
//         type: "position",
//         startCount: 0,
//         endCount: 2,
//         items: [
//           {
//             memberId: "aaa",
//             x: 50,
//             y: 50,
//           },
//         ],
//       },
//       {
//         type: "position",
//         startCount: 6,
//         endCount: 7,
//         items: [
//           {
//             memberId: "aaa",
//             x: 450,
//             y: 450,
//           },
//         ],
//       },
//       {
//         type: "hit",
//         count: 0,
//         name: "Pose",
//       },
//       {
//         type: "hit",
//         count: 0,
//         name: "Test",
//         memberIds: ["aaa"],
//       },
//     ],
//   },
//   {
//     id: "berry-lm2024",
//     teamId: "berry",
//     name: "LM 2024",
//     counts: 150,
//     actions: [],
//   },
// ];

class ChoreoService {
  async getAll() {
    console.log(Choreo.associations);
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
    return Choreo.findByPk(id);
  }

  async create(name, count, TeamId, Lineups = [], Hits = []) {
    logger.debug(
      `ChoreoService.create ${{ name, count, TeamId, Lineups, Hits }}`
    );
    return Choreo.create(
      { name, count, TeamId, Lineups, Hits },
      { include: ["Lineups", "Hits"] }
    );
  }

  async update(id, data) {
    return Choreo.findByPk(id).then(async (foundChoreo) => {
      if (foundChoreo) {
        logger.debug(`ChoreoService.update ${{ id, data }}`);
        await foundChoreo.update(data);
        return foundChoreo.save();
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
        logger.debug(`ChoreoService.remove ${{ id, data }}`);
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
