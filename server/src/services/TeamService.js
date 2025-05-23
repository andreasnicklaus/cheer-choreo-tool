const { Op } = require("sequelize");
const Team = require("../db/models/team");
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
   * @param {number} UserId - The user ID.
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to fetch all teams.
   * @returns {Promise<Array>} List of teams.
   */
  async getAll(UserId, options = { all: false }) {
    return Team.findAll({
      where: options.all ? {} : { UserId },
      include: defaultInclude,
    });
  }

  /**
   * Find teams by name for a user.
   * @param {string} name - The name of the team.
   * @param {number} UserId - The user ID.
   * @returns {Promise<Array>} List of teams.
   */
  async findByName(name, UserId) {
    return Team.findAll({
      where: { name, UserId },
      include: defaultInclude,
    });
  }

  /**
   * Find a team by ID for a user.
   * @param {number} id - The ID of the team.
   * @param {number} UserId - The user ID.
   * @returns {Promise<Object>} The team object.
   */
  async findById(id, UserId) {
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
    return Team.count();
  }

  /**
   * Get the trend of team creation and deletion.
   * @returns {Promise<number>} The trend value.
   */
  getTrend() {
    return Promise.all([
      Team.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Team.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Create a new team and associate it with a season.
   * @param {string} name - The name of the team.
   * @param {number} ClubId - The club ID.
   * @param {number} SeasonId - The season ID.
   * @param {number} UserId - The user ID.
   * @returns {Promise<Object>} The created team object.
   */
  async create(name, ClubId, SeasonId, UserId) {
    logger.debug(
      `TeamService.create ${JSON.stringify({ name, ClubId, SeasonId, UserId })}`
    );
    return Team.create({ name, ClubId, UserId }).then((team) =>
      SeasonTeamService.create(team.id, SeasonId, [], UserId).then(
        (seasonTeam) => this.findById(team.id, UserId)
      )
    );
  }

  /**
   * Find or create a team.
   * @param {string} name - The name of the team.
   * @param {number} ClubId - The club ID.
   * @param {number} UserId - The user ID.
   * @returns {Promise<Object>} The found or created team object.
   */
  async findOrCreate(name, ClubId, UserId) {
    logger.debug(
      `TeamService.findOrCreate ${JSON.stringify({ name, ClubId, UserId })}`
    );
    const [team, created] = await Team.findOrCreate({
      where: { name, ClubId, UserId },
    });
    return team;
  }

  /**
   * Update a team.
   * @param {number} id - The ID of the team.
   * @param {Object} data - The data to update.
   * @param {number} UserId - The user ID.
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to update all teams.
   * @returns {Promise<Object>} The updated team object.
   */
  async update(id, data, UserId, options = { all: false }) {
    return Team.findOne({ where: options.all ? { id } : { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundTeam) => {
        if (foundTeam) {
          logger.debug(
            `TeamService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundTeam.update(data);
          return foundTeam.save();
        } else
          throw Error(`Beim Update wurde kein Team mit der ID ${id} gefunden`);
      });
  }

  /**
   * Remove a team.
   * @param {number} id - The ID of the team.
   * @param {number} UserId - The user ID.
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to remove all teams.
   * @returns {Promise<void>} Resolves when the team is removed.
   */
  async remove(id, UserId, options = { all: false }) {
    return Team.findOne({ where: options.all ? { id } : { id, UserId } }) // njsscan-ignore: node_nosqli_injection
      .then((foundTeam) => {
        if (foundTeam) {
          logger.debug(`TeamService.remove ${JSON.stringify({ id, UserId })}`);
          return foundTeam.destroy();
        } else {
          throw Error(`Beim Löschen wurde kein Team mit der ID ${id} gefunden`);
        }
      });
  }
}

module.exports = new TeamService();
