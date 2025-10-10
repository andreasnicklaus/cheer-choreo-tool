import SeasonTeam from "../db/models/seasonTeam";
import Team from "../db/models/team";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");
const SeasonTeamService = require("./SeasonTeamService");

const defaultInclude = [
  {
    association: "SeasonTeams",
    include: ["Season", "Members"],
  },
];

/**
 * Service for managing team entities and their associations.
 * Handles CRUD operations and team-specific logic.
 *
 * @class TeamService
 */
class TeamService {
  /**
   * Get all teams for a user.
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to fetch all teams.
   * @returns {Promise<Array>} List of teams.
   */
  async getAll(UserId: string | null, options = { all: false }) {
    logger.debug(`TeamService getAll ${JSON.stringify({ UserId, options })}`);
    return Team.findAll({
      where: options.all ? {} : UserId ? { UserId } : {},
      include: defaultInclude,
    });
  }

  /**
   * Find teams by name for a user.
   * @param {string} name - The name of the team.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Array>} List of teams.
   */
  async findByName(name: string, UserId: string) {
    logger.debug(`TeamService findByName ${JSON.stringify({ name, UserId })}`);
    return Team.findAll({
      where: { name, UserId },
      include: defaultInclude,
    });
  }

  /**
   * Find a team by ID for a user.
   * @param {string} id - The ID of the team.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The team object.
   */
  async findById(id: string, UserId: string) {
    logger.debug(`TeamService findById ${JSON.stringify({ id, UserId })}`);
    return Team.findOne({
      where: { id, UserId },
      include: defaultInclude,
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get the total count of teams.
   * @returns {Promise<number>} The count of teams.
   */
  getCount() {
    logger.debug(`TeamService getCount`);
    return Team.count();
  }

  /**
   * Get the trend of team creation and deletion.
   * @returns {Promise<number>} The trend value.
   */
  getTrend() {
    logger.debug(`TeamService getTrend`);
    return Promise.all([
      Team.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      Team.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Create a new team and associate it with a season.
   * @param {string} name - The name of the team.
   * @param {string} ClubId - The club ID.
   * @param {string} SeasonId - The season ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The created team object.
   */
  async create(name: string, ClubId: string, SeasonId: string, UserId: string) {
    logger.debug(
      `TeamService create ${JSON.stringify({ name, ClubId, SeasonId, UserId })}`,
    );
    return Team.create({ name, ClubId, UserId }).then((team: Team) =>
      SeasonTeamService.create(team.id, SeasonId, [], UserId).then(
        (_seasonTeam: SeasonTeam) => this.findById(team.id, UserId),
      ),
    );
  }

  /**
   * Find or create a team.
   * @param {string} name - The name of the team.
   * @param {string} ClubId - The club ID.
   * @param {string} UserId - The user ID.
   * @returns {Promise<Object>} The found or created team object.
   */
  async findOrCreate(name: string, ClubId: string, UserId: string) {
    logger.debug(
      `TeamService findOrCreate ${JSON.stringify({ name, ClubId, UserId })}`,
    );
    const [team, _created] = await Team.findOrCreate({
      where: { name, ClubId, UserId },
    });
    return team;
  }

  /**
   * Update a team.
   * @param {string} id - The ID of the team.
   * @param {Object} data - The data to update.
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to update all teams.
   * @returns {Promise<Object>} The updated team object.
   */
  async update(
    id: string,
    data: object,
    UserId: string | null,
    options = { all: false },
  ) {
    logger.debug(`TeamService update ${JSON.stringify({ id, data, UserId })}`);
    return Team.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundTeam: Team | null) => {
        if (foundTeam) {
          await foundTeam.update(data);
          return foundTeam.save();
        } else {
          logger.error(`No team found with ID ${id} when updating`);
          throw new Error(`No team found with ID ${id} when updating`);
        }
      });
  }

  /**
   * Remove a team.
   * @param {string} id - The ID of the team.
   * @param {string} UserId - The user ID.
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to remove all teams.
   * @returns {Promise<void>} Resolves when the team is removed.
   */
  async remove(id: string, UserId: string | null, options = { all: false }) {
    logger.debug(
      `TeamService remove ${JSON.stringify({ id, UserId, options })}`,
    );
    return Team.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundTeam) => {
        if (foundTeam) {
          return foundTeam.destroy();
        } else {
          logger.error(`No team found with ID ${id} when deleting`);
          throw new Error(`No team found with ID ${id} when deleting`);
        }
      });
  }
}

export default new TeamService();
