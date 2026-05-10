import { NotFoundError } from "@/utils/errors";
import Choreo from "../db/models/choreo";
import Club from "../db/models/club";
import Season from "../db/models/season";
import SeasonTeam from "../db/models/seasonTeam";
import Team from "../db/models/team";
import ChoreoService from "./ChoreoService";
import HitService from "./HitService";
import MemberService from "./MemberService";
import SeasonService from "./SeasonService";
import TeamService from "./TeamService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");

const defaultInclude = [
  { association: "User" },
  {
    model: Team,
    as: "Teams",
    include: [
      {
        model: SeasonTeam,
        as: "SeasonTeams",
        include: [
          { association: "Choreos", include: [{ association: "User" }] },
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
   * Get all Clubs with specified ownerId
   *
   * @param {string[] | null} ownerIds
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }]
   * @param {boolean} [options.all=false]
   * @returns {Club[]}
   */
  async getAll(
    ownerIds: string[] | null,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ClubService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin, options })}`,
    );

    const accessibleOwnerIds =
      ownerIds && ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [actingUserId];

    return Club.findAll({
      where: options.all
        ? {}
        : accessibleOwnerIds.length > 0
          ? { UserId: { [Op.in]: accessibleOwnerIds } }
          : { UserId: actingUserId },
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
    logger.debug(`ClubService getCount`);
    return Club.count();
  }

  /**
   * Get the number of new Clubs minus then number of deleted Clubs in the last 30 days
   *
   * @returns {number}
   */
  getTrend() {
    logger.debug(`ClubService getTrend`);
    return Promise.all([
      Club.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      Club.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Find Club by its ID
   *
   * @param {UUID} id
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @returns {Club}
   */
  async findById(id: string, actingUserId: string, isAdmin = false) {
    logger.debug(
      `ClubService findById ${JSON.stringify({ id, actingUserId, isAdmin })}`,
    );

    const club = await Club.findByPk(id);
    if (!club) {
      return null;
    }

    await checkReadAccess(club.UserId, actingUserId, isAdmin);

    return Club.findOne({
      where: { id },
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
   * @param {string} name
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @returns {Club[]}
   */
  async findByName(
    name: string,
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ClubService findByName ${JSON.stringify({ name, ownerIds, actingUserId, isAdmin })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [actingUserId];

    return Club.findAll({
      where:
        accessibleOwnerIds.length > 0
          ? { name, UserId: { [Op.in]: accessibleOwnerIds } }
          : { name },
      include: defaultInclude,
    });
  }

  /**
   * Create a new Club
   *
   * @param {string} name
   * @param {UUID|null} ownerId - Owner ID. If null/undefined, falls back to actingUserId
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @returns {Club}
   */
  async create(
    name: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ClubService create ${JSON.stringify({ name, ownerId, actingUserId, isAdmin })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Club.create({
      name,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    }).then((club: Club) =>
      Club.count({ where: { UserId: ownerId } }).then(async (count: number) => {
        if (count <= 1) {
          await this.seedDemo(club, ownerId, actingUserId);
          const foundClub = await this.findById(club.id, actingUserId, isAdmin);
          if (!foundClub) {
            logger.error(`Club with id ${club.id} not found after creation`);
            throw new NotFoundError(
              `Club with id ${club.id} not found after creation`,
            );
          }
          club = foundClub;
        }
        return club;
      }),
    );
  }

  /**
   * Seed a demo team and choreo for a Club
   *
   * @param {Club} club
   * @param {UUID} ownerId
   * @param {UUID} actingUserId
   * @returns {void}
   */
  async seedDemo(club: Club, ownerId: string, actingUserId: string) {
    logger.debug(
      `ClubService seedDemo ${JSON.stringify({ club, ownerId, actingUserId })}`,
    );
    return SeasonService.getAll(null, actingUserId).then(
      (seasons: Season[]) => {
        const currentSeason = seasons.find(
          (s) => s.year == new Date().getFullYear(),
        ) as Season;
        return TeamService.create(
          "Demo-Team",
          club.id,
          currentSeason.id,
          ownerId,
          actingUserId,
        ).then((team: Team | null) => {
          if (!team) return;
          const seasonTeam = team.SeasonTeams[0];
          return Promise.all([
            MemberService.create(
              "Tina Turnerin",
              "Tini",
              "T",
              seasonTeam.id,
              actingUserId,
            ),
            MemberService.create(
              "Zoe Zuverlässig",
              "Zoe",
              "Z",
              seasonTeam.id,
              actingUserId,
            ),
            MemberService.create(
              "Fenja Flyer",
              "Fipsi",
              "F",
              seasonTeam.id,
              actingUserId,
            ),
          ]).then((members) =>
            ChoreoService.create(
              "Demo-Choreo",
              25,
              undefined,
              seasonTeam.id,
              members.map((m) => ({ id: m.id })),
              ownerId,
              actingUserId,
            ).then((choreo: Choreo | null) => {
              if (!choreo) return;
              return Promise.all([
                HitService.create(
                  "Pose",
                  0,
                  choreo.id,
                  members.map((m) => m.id),
                  actingUserId,
                ),
                HitService.create(
                  "Flick-Flack",
                  2,
                  choreo.id,
                  [members[0].id],
                  actingUserId,
                ),
              ]);
            }),
          );
        });
      },
    );
  }

  /**
   * Find or create a club.
   *
   * @param {string} name
   * @param {UUID|null} ownerId - Owner ID. If null/undefined, falls back to actingUserId
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @returns {Club}
   */
  async findOrCreate(
    name: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ): Promise<[Club, boolean]> {
    logger.debug(
      `ClubService findOrCreate ${JSON.stringify({ name, ownerId, actingUserId, isAdmin })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const [club, created] = await Club.findOrCreate({
      where: { name, UserId: ownerId },
      defaults: {
        name,
        UserId: ownerId,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    return [club, created];
  }

  /**
   * Update a Club
   *
   * @param {UUID} id
   * @param {Object} data
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }]
   * @param {boolean} [options.all=false]
   * @returns {Club}
   */
  async update(
    id: string,
    data: object,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ClubService update ${JSON.stringify({ id, data, actingUserId, isAdmin, options })}`,
    );

    const club = await Club.findByPk(id);
    if (!club) {
      throw new NotFoundError(`No club found with ID ${id} when updating`);
    }

    await checkWriteAccess(club.UserId, actingUserId, isAdmin);

    await club.update({
      ...data,
      updaterId: actingUserId,
    });
    return club.save();
  }

  /**
   * Remove a Club
   *
   * @param {UUID} id
   * @param {UUID} actingUserId
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }]
   * @param {boolean} [options.all=false]
   * @returns {Promise<void>}
   */
  async remove(
    id: string,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ClubService remove ${JSON.stringify({ id, actingUserId, isAdmin, options })}`,
    );

    const club = await Club.findByPk(id);
    if (!club) {
      throw new NotFoundError(`No club found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(club.UserId, actingUserId, isAdmin);

    return club.destroy();
  }

  async migrateCreatorUpdater() {
    logger.debug(`ClubService migrateCreatorUpdater`);

    const clubs = await Club.findAll({
      where: { creatorId: { [Op.is]: null }, UserId: { [Op.not]: null } },
    });

    await Promise.all(
      clubs.map((club) =>
        club.update({ creatorId: club.UserId, updaterId: club.UserId }),
      ),
    );
  }
}

export default new ClubService();
