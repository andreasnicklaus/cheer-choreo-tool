const { Op } = require("sequelize");
const Club = require("../db/models/club");
const Member = require("../db/models/member");
const SeasonTeam = require("../db/models/seasonTeam");
const Team = require("../db/models/team");
const { logger } = require("../plugins/winston");
const ChoreoService = require("./ChoreoService");
const HitService = require("./HitService");
const MemberService = require("./MemberService");
const SeasonService = require("./SeasonService");
const SeasonTeamService = require("./SeasonTeamService");
const TeamService = require("./TeamService");

const defaultInclude = [
  {
    association: "Teams",
    include: {
      association: "SeasonTeams",
      include: ["Choreos", "Season", "Members"],
    },
  },
];

class ClubService {
  async getAll(UserId, options = { all: false }) {
    return Club.findAll({
      where: options.all ? {} : { UserId },
      include: defaultInclude,
      order: [
        ["createdAt"],
        [Club.associations.Teams, "name"],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Season,
          "year",
          "DESC NULLS LAST",
        ],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Season,
          "name",
        ],
      ],
    });
  }

  getCount() {
    return Club.count();
  }

  getTrend() {
    return Promise.all([
      Club.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Club.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  async findById(id, UserId) {
    return Club.findOne({
      where: { id, UserId },
      include: defaultInclude,
      order: [
        [Club.associations.Teams, "name"],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Season,
          "year",
          "DESC NULLS LAST",
        ],
        [
          Club.associations.Teams,
          Team.associations.SeasonTeams,
          SeasonTeam.associations.Members,
          "name",
        ],
      ],
    });
  }

  async findByName(name, UserId) {
    return Club.findAll({
      where: { name, UserId },
      include: defaultInclude,
    });
  }

  async create(name, UserId) {
    logger.debug(`ClubService.create ${JSON.stringify({ name, UserId })}`);
    return Club.create({ name, UserId }).then((club) =>
      Club.count({ where: { UserId } }).then(async (count) => {
        if (count <= 1) {
          await this.seedDemo(club, UserId);
          club = await this.findById(club.id, UserId);
        }
        return club;
      })
    );
  }

  async seedDemo(club, UserId) {
    SeasonService.getAll(null).then((seasons) => {
      const currentSeason = seasons.find(
        (s) => s.year == new Date().getFullYear()
      );
      TeamService.create("Demo-Team", club.id, currentSeason.id, UserId).then(
        (team) => {
          const seasonTeam = team.SeasonTeams[0];
          Promise.all([
            MemberService.create(
              "Tina Turnerin",
              "Tini",
              "T",
              seasonTeam.id,
              UserId
            ),
            MemberService.create(
              "Zoe Zuverlässig",
              "Zoe",
              "Z",
              seasonTeam.id,
              UserId
            ),
            MemberService.create(
              "Fenja Flyer",
              "Fipsi",
              "F",
              seasonTeam.id,
              UserId
            ),
          ]).then((members) =>
            ChoreoService.create(
              "Demo-Choreo",
              25,
              seasonTeam.id,
              members.map((m) => ({ id: m.id })),
              UserId
            ).then((choreo) => {
              Promise.all([
                HitService.create(
                  "Pose",
                  0,
                  choreo.id,
                  members.map((m) => m.id),
                  UserId
                ),
                HitService.create(
                  "Flick-Flack",
                  2,
                  choreo.id,
                  [members[0].id],
                  UserId
                ),
              ]);
            })
          );
        }
      );
    });
  }

  async findOrCreate(name, UserId) {
    logger.debug(
      `ClubService.findOrCreate ${JSON.stringify({ name, UserId })}`
    );
    const [club, created] = await Club.findOrCreate({
      where: { name, UserId },
    });
    return club;
  }

  async update(id, data, UserId) {
    return Club.findOne({ where: { id, UserId } }).then(async (foundClub) => {
      if (foundClub) {
        logger.debug(
          `ClubService.update ${JSON.stringify({ id, data, UserId })}`
        );
        await foundClub.update(data);
        return foundClub.save();
      } else {
        throw Error(`Beim Update wurde kein Club mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id, UserId) {
    return Club.findOne({ where: { id, UserId } }).then((foundClub) => {
      if (foundClub) {
        logger.debug(`ClubService.remove ${JSON.stringify({ id })}`);
        return foundClub.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Club mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new ClubService();
