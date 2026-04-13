import { NotFoundError } from "@/utils/errors";
import SeasonTeam from "../db/models/seasonTeam";
import Team from "../db/models/team";
import SeasonTeamService from "./SeasonTeamService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");

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
   * @param {string[] | null} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to fetch all teams.
   * @returns {Promise<Array>} List of teams.
   */
  async getAll(
    ownerIds: string[] | null,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `TeamService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin, options })}`,
    );

    const accessibleOwnerIds =
      ownerIds && ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return Team.findAll({
      where: options.all
        ? {}
        : accessibleOwnerIds.length > 0
          ? { UserId: { [Op.in]: accessibleOwnerIds } }
          : {},
      include: defaultInclude,
    });
  }

  /**
   * Find teams by name for a user.
   * @param {string} name - The name of the team.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Array>} List of teams.
   */
  async findByName(
    name: string,
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `TeamService findByName ${JSON.stringify({ name, ownerIds, actingUserId, isAdmin })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [];

    return Team.findAll({
      where:
        accessibleOwnerIds.length > 0
          ? { name, UserId: { [Op.in]: accessibleOwnerIds } }
          : { name },
      include: defaultInclude,
    });
  }

  /**
   * Find a team by ID for a user.
   * @param {UUID} id - The ID of the team.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Object>} The team object.
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `TeamService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const team = await Team.findByPk(id);
    if (!team) {
      return null;
    }

    await checkReadAccess(team.UserId, actingUserId, isAdmin);

    return Team.findOne({
      where: { id },
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
   * @param {UUID} ClubId - The club ID.
   * @param {UUID} SeasonId - The season ID.
   * @param {UUID} ownerId - The owner ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Object>} The created team object.
   */
  async create(
    name: string,
    ClubId: string,
    SeasonId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `TeamService create ${JSON.stringify({
        name,
        ClubId,
        SeasonId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Team.create({
      name,
      ClubId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    }).then((team: Team) => {
      return SeasonTeamService.create(
        team.id,
        SeasonId,
        [],
        ownerId,
        actingUserId,
      ).then((_seasonTeam: SeasonTeam | null) =>
        this.findById(team.id, actingUserId, isAdmin),
      );
    });
  }

  /**
   * Find or create a team.
   * @param {string} name - The name of the team.
   * @param {UUID} ClubId - The club ID.
   * @param {UUID} ownerId - The owner ID.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Object>} The found or created team object.
   */
  async findOrCreate(
    name: string,
    ClubId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `TeamService findOrCreate ${JSON.stringify({ name, ClubId, ownerId, actingUserId, isAdmin })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const [team, _created] = await Team.findOrCreate({
      where: { name, ClubId, UserId: ownerId },
      defaults: {
        name,
        ClubId,
        UserId: ownerId,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    return team;
  }

  /**
   * Update a team.
   * @param {UUID} id - The ID of the team.
   * @param {Object} data - The data to update.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to update all teams.
   * @returns {Promise<Object>} The updated team object.
   */
  async update(
    id: string,
    data: object,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `TeamService update ${JSON.stringify({ id, data, actingUserId, isAdmin, options })}`,
    );

    const team = await Team.findByPk(id);
    if (!team) {
      throw new NotFoundError(`No team found with ID ${id} when updating`);
    }

    await checkWriteAccess(team.UserId, actingUserId, isAdmin);

    await team.update({
      ...data,
      updaterId: actingUserId,
    });
    return team.save();
  }

  /**
   * Remove a team.
   * @param {UUID} id - The ID of the team.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} options - Options for filtering.
   * @param {boolean} options.all - Whether to remove all teams.
   * @returns {Promise<void>} Resolves when the team is removed.
   */
  async remove(
    id: string,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `TeamService remove ${JSON.stringify({ id, actingUserId, isAdmin, options })}`,
    );

    const team = await Team.findByPk(id);
    if (!team) {
      throw new NotFoundError(`No team found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(team.UserId, actingUserId, isAdmin);

    return team.destroy();
  }
}

export default new TeamService();
