import Choreo from "../db/models/choreo";
import Club from "../db/models/club";
import Season from "../db/models/season";
import SeasonTeam from "../db/models/seasonTeam";
import Team from "../db/models/team";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");
const ChoreoService = require("./ChoreoService");
const HitService = require("./HitService");
const MemberService = require("./MemberService");
const SeasonService = require("./SeasonService");
const TeamService = require("./TeamService");

const defaultInclude = [
  {
    model: Team,
    as: "Teams",
    include: [
      {
        model: SeasonTeam,
        as: "SeasonTeams",
        include: [
          { association: "Choreos" },
          { association: "Season" },
          { association: "Members" },
        ],
      },
    ],
  },
];

/**
 * Service for managing club entities and their associations.
 * Handles CRUD operations and club-specific logic.
 *
 * @class ClubService
 */
class ClubService {
  /**
   * Get all Clubs with specified UserId
   *
   * @async
   * @param {UUID} UserId
   * @param {Object} [options={ all: false }]
   * @param {boolean} [options.all=false]
   * @returns {Club[]}
   */
  async getAll(UserId: string | null, options = { all: false }) {
    logger.debug(`ClubService getAll ${JSON.stringify({ UserId, options })}`)
    return Club.findAll({
      where: options.all ? {} : (UserId ? { UserId } : {}),
      include: defaultInclude,
      order: [
        ["createdAt", "ASC"],
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

  /**
   * Get the number of Clubs in the DB
   *
   * @returns {number}
   */
  getCount() {
    logger.debug(`ClubService getCount`)
    return Club.count();
  }

  /**
   * Get the number of new Clubs minus then number of deleted Clubs in the last 30 days
   *
   * @returns {number}
   */
  getTrend() {
    logger.debug(`ClubService getTrend`)
    return Promise.all([
      Club.count({
        where: {
          createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Club.count({
        where: {
          deletedAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Find Club by its ID
   *
   * @async
   * @param {UUID} id
   * @param {UUID} UserId
   * @returns {Club}
   */
  async findById(id: string, UserId: string) {
    logger.debug(`ClubService findById ${JSON.stringify({ id, UserId })}`)
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
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Find Club by its name
   *
   * @async
   * @param {string} name
   * @param {UUID} UserId
   * @returns {Club}
   */
  async findByName(name: string, UserId: string) {
    logger.debug(`ClubService findByName ${JSON.stringify({ name, UserId })}`)
    return Club.findAll({
      where: { name, UserId },
      include: defaultInclude,
    });
  }

  /**
   * Create a new Club
   *
   * @async
   * @param {string} name
   * @param {UUID} UserId
   * @returns {Club}
   */
  async create(name: string, UserId: string) {
    logger.debug(`ClubService create ${JSON.stringify({ name, UserId })}`);
    return Club.create({ name, UserId }).then((club: Club) =>
      Club.count({ where: { UserId } }).then(async (count: number) => {
        if (count <= 1) {
          await this.seedDemo(club, UserId);
          const foundClub = await this.findById(club.id, UserId);
          if (!foundClub) {
            logger.error(`Club with id ${club.id} not found after creation`);
            throw new Error(`Club with id ${club.id} not found after creation`);
          }
          club = foundClub;
        }
        return club;
      })
    );
  }

  /**
   * Seed a demo team and choreo for a Club
   *
   * @async
   * @param {Club} club
   * @param {UUID} UserId
   * @returns {void}
   */
  async seedDemo(club: Club, UserId: string) {
    logger.debug(`ClubService seedDemo ${JSON.stringify({ club, UserId })}`)
    SeasonService.getAll(null).then((seasons: Season[]) => {
      const currentSeason = seasons.find(
        (s) => s.year == new Date().getFullYear()
      ) as Season;
      TeamService.create("Demo-Team", club.id, currentSeason.id, UserId).then(
        (team: Team) => {
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
              undefined,
              seasonTeam.id,
              members.map((m) => ({ id: m.id })),
              UserId
            ).then((choreo: Choreo) => {
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

  /**
   * Find or create (if it does not exist) a Club
   *
   * @async
   * @param {string} name
   * @param {UUID} UserId
   * @returns {Club}
   */
  async findOrCreate(name: string, UserId: string) {
    logger.debug(
      `ClubService findOrCreate ${JSON.stringify({ name, UserId })}`
    );
    const [club, _created] = await Club.findOrCreate({
      where: { name, UserId },
    });
    return club;
  }

  /**
   * Update a Club
   *
   * @async
   * @param {UUID} id
   * @param {Object} data
   * @param {UUID} UserId
   * @param {Object} [options={ all: false }]
   * @param {boolean} [options.all=false]
   * @returns {Club}
   */
  async update(id: string, data: object, UserId: string | null, options = { all: false }) {
    logger.debug(`ClubService update ${JSON.stringify({ id, data, UserId, options })}`);
    return Club.findOne({ where: options.all || !UserId ? { id } : { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundClub) => {
        if (foundClub) {
          await foundClub.update(data);
          return foundClub.save();
        } else {
          logger.error(`No club found with ID ${id} when updating`);
          throw new Error(`No club found with ID ${id} when updating`);
        }
      });
  }

  /**
   * Remove a Club
   *
   * @async
   * @param {UUID} id
   * @param {UUID} UserId
   * @param {Object} [options={ all: false }]
   * @param {boolean} [options.all=false]
   * @returns {Promise<void>}
   */
  async remove(id: string, UserId: string | null, options = { all: false }) {
    logger.debug(`ClubService remove ${JSON.stringify({ id, UserId, options })}`);
    return Club.findOne({ where: options.all || !UserId ? { id } : { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundClub) => {
        if (foundClub) {
          return foundClub.destroy();
        } else {
          logger.error(`No club found with ID ${id} when deleting`);
          throw new Error(`No club found with ID ${id} when deleting`);
        }
      });
  }
}

export default new ClubService();
