const { Json } = require("sequelize/lib/utils");
const Choreo = require("../db/models/choreo");
const { logger } = require("../plugins/winston");
const PositionService = require("./PositionService");
const LineupService = require("./LineupService");
const ChoreoParticipation = require("../db/models/choreoParticipation");
const Position = require("../db/models/position");
const Hit = require("../db/models/hit");
const { Op } = require("sequelize");

const defaultColors = [
  "#FF1493",
  "#C71585",
  "#4B0082",
  "#9400D3",
  "#6A5ACD",
  "#8B0000",
  "#FF4500",
  "#FF8C00",
  "#006400",
  "#228B22",
  "#00008B",
  "#0000FF",
  "#1E90FF",
  "#A52A2A",
  "#008080",
  "#48D1CC",
  "#00FFFF",
  "#2F4F4F",
  "#FFFF00",
];

const defaultInclude = [
  {
    association: "SeasonTeam",
    include: ["Members", "Season", "Team"],
  },
  {
    association: "Hits",
    include: "Members",
  },
  "Participants",
];

class ChoreoService {
  async getAll(UserId, options = { all: false }) {
    return Choreo.findAll({
      where: options.all ? {} : { UserId },
      include: defaultInclude,
    });
  }

  async findByTeamId(TeamId, UserId) {
    return Choreo.findAll({
      where: { TeamId, UserId },
      include: defaultInclude,
    });
  }

  getCount() {
    return Choreo.count();
  }

  getTrend() {
    return Promise.all([
      Choreo.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Choreo.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  async findById(id, UserId) {
    return Choreo.findOne({
      where: { UserId, id },
      include: defaultInclude,
    }).then(async (choreo) => {
      const lineups = await LineupService.findByChoreoId(choreo.id);
      choreo.dataValues.Lineups = lineups;
      await Promise.all(
        choreo.dataValues.Lineups.map(async (lineup) => {
          lineup.dataValues.Positions = await PositionService.findByLineupId(
            lineup.id,
            UserId
          );
          return lineup;
        })
      );
      return choreo;
    });
  }

  async create(name, counts, SeasonTeamId, participants, UserId) {
    logger.debug(
      `ChoreoService.create ${JSON.stringify({
        name,
        counts,
        SeasonTeamId,
        participants,
        UserId,
      })}`
    );
    return Choreo.create({
      name,
      counts,
      SeasonTeamId,
      UserId,
    }).then((choreo) =>
      Promise.all(
        participants.map((p) =>
          this.addParticipant(choreo.id, p.id, UserId, p.color)
        )
      ).then(() => this.findById(choreo.id, UserId))
    );
  }

  async findOrCreate(name, counts, SeasonTeamId, UserId) {
    logger.debug(
      `ChoreoService.findOrCreate ${JSON.stringify({
        name,
        counts,
        SeasonTeamId,
        UserId,
      })}`
    );
    const [choreo, created] = await Choreo.findOrCreate({
      where: { name, counts, SeasonTeamId, UserId },
    });
    return choreo;
  }

  async addParticipant(choreoId, memberId, UserId, color = null) {
    return this.findById(choreoId, UserId).then((choreo) =>
      choreo.addParticipant(memberId, {
        through: {
          color:
            color ||
            defaultColors[Math.floor(Math.random() * defaultColors.length)],
        },
      })
    );
  }

  async removeParticipant(ChoreoId, MemberId) {
    return ChoreoParticipation.findOne({
      where: { MemberId, ChoreoId },
    }).then((foundChoreoParticipation) => {
      return foundChoreoParticipation.destroy();
    });
  }

  async replaceParticipant(ChoreoId, memberToAddId, memberToRemoveId, UserId) {
    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: memberToRemoveId },
    }).then(async (foundChoreoParticipation) => {
      const color = foundChoreoParticipation.color;
      await this.removeParticipant(ChoreoId, memberToRemoveId);
      await this.addParticipant(ChoreoId, memberToAddId, UserId, color);

      await Promise.all([
        // Update all Positions
        Position.findAll({
          where: { UserId, MemberId: memberToRemoveId },
        }).then((positionList) =>
          Promise.all(
            positionList.map((position) => position.setMember(memberToAddId))
          )
        ),
        // Update all Hits
        Hit.findAll({ where: { ChoreoId, UserId }, include: "Members" }).then(
          (hitList) => {
            hitList = hitList.filter((hit) =>
              hit.Members.some((m) => m.id == memberToRemoveId)
            );
            return Promise.all(
              hitList.map(async (hit) =>
                Promise.all([
                  hit.removeMember(memberToRemoveId),
                  hit.addMember(memberToAddId),
                ])
              )
            );
          }
        ),
      ]);

      return this.findById(ChoreoId, UserId);
    });
  }

  changeParticipationColor(ChoreoId, participantId, color, UserId) {
    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: participantId },
    }).then(async (foundChoreoParticipation) => {
      await foundChoreoParticipation.update({ color });
      return foundChoreoParticipation.save();
    });
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
          return this.findById(id, UserId);
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
            `ChoreoService.remove ${JSON.stringify({ id, UserId })}`
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
