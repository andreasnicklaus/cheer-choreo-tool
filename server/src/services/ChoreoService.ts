import { NotFoundError } from "@/utils/errors";
import Choreo, { defaultMatType, MatType } from "../db/models/choreo";
import ChoreoParticipation from "../db/models/choreoParticipation";
import Hit from "../db/models/hit";
import Lineup from "../db/models/lineup";
import Member from "../db/models/member";
import Position from "../db/models/position";
import LineupService from "./LineupService";
import MemberService from "./MemberService";
import PositionService from "./PositionService";
import {
  checkReadAccess,
  checkWriteAccess,
  checkDeleteAccess,
  filterAccessibleOwnerIds,
} from "../utils/accessControl";

const { logger } = require("../plugins/winston");
const { Op } = require("sequelize");

/**
 * Set of web-safe HEX color codes
 *
 * @type {string[]}
 * @ignore
 */
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
  { association: "User" },
  { association: "creator" },
  { association: "updater" },
  {
    association: "SeasonTeam",
    include: [
      { association: "Members" },
      { association: "Season" },
      { association: "Team" },
    ],
  },
  {
    association: "Hits",
    include: [{ association: "Members" }],
  },
  { association: "Participants" },
];

/**
 * Service for managing choreography entities and their associations.
 * Handles CRUD operations and related logic for choreographies.
 *
 * @class ChoreoService
 */
class ChoreoService {
  /**
   * Get all Choreos for the specified owners.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<Choreo[]>} List of choreographies.
   */
  async getAll(
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ChoreoService getAll ${JSON.stringify({ ownerIds, actingUserId, isAdmin, options })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [actingUserId];

    return Choreo.findAll({
      where: options.all ? {} : { UserId: { [Op.in]: accessibleOwnerIds } },
      include: defaultInclude,
    });
  }

  /**
   * Find all Choreos with specified UserId and TeamId
   *
   * @param {UUID} SeasonTeamId - The SeasonTeam's UUID.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Choreo[]>} List of choreographies.
   */
  async findBySeasonTeamId(
    SeasonTeamId: string,
    ownerIds: string[],
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ChoreoService findBySeasonTeamId ${JSON.stringify({
        SeasonTeamId,
        ownerIds,
        actingUserId,
        isAdmin,
      })}`,
    );

    const accessibleOwnerIds =
      ownerIds.length > 0
        ? await filterAccessibleOwnerIds(ownerIds, actingUserId, isAdmin)
        : [actingUserId];

    return Choreo.findAll({
      where:
        accessibleOwnerIds.length > 0
          ? { SeasonTeamId, UserId: { [Op.in]: accessibleOwnerIds } }
          : { SeasonTeamId },
      include: defaultInclude,
    });
  }

  /**
   * Get the number of Choreos in the DB
   *
   * @returns {Promise<number>} Count of choreographies.
   */
  getCount() {
    logger.debug(`ChoreoService getCount`);
    return Choreo.count();
  }

  /**
   * Get the number of new Choreos minus the number of deleted Choreos in the last 30 days
   *
   * @returns {Promise<number>} Trend of choreographies.
   */
  getTrend() {
    logger.debug(`ChoreoService getTrend`);
    return Promise.all([
      Choreo.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      Choreo.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Find Choreo by its ID
   *
   * @param {UUID} id - The choreography's UUID.
   * @param {UUID[]} ownerIds - Array of owner IDs the acting user has access to.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<Choreo>} The choreography.
   */
  async findById(
    id: string,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ChoreoService findById ${JSON.stringify({ id, actingUserId, isAdmin, options })}`,
    );

    const choreo = await Choreo.findByPk(id);
    if (!choreo) {
      throw new NotFoundError(`Choreo with ID ${id} not found`);
    }

    await checkReadAccess(choreo.UserId, actingUserId, isAdmin);

    return Choreo.findOne({
      where: { id },
      include: defaultInclude,
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (choreo: Choreo | null) => {
        if (!choreo) {
          logger.error(`Choreo with ID ${id} not found`);
          throw new NotFoundError(`Choreo with ID ${id} not found`);
        }
        const lineups = await LineupService.findByChoreoId(choreo.id);
        // Add Lineups property dynamically to dataValues
        (choreo.dataValues as { Lineups?: Lineup[] }).Lineups = lineups;
        await Promise.all(
          (choreo.dataValues as { Lineups?: Lineup[] }).Lineups!.map(
            async (lineup: Lineup) => {
              (lineup.dataValues as Record<string, unknown>).Positions =
                await PositionService.findByLineupId(
                  lineup.id,
                  [choreo.UserId],
                  actingUserId,
                );
              return lineup;
            },
          ),
        );
        return choreo;
      });
  }

  /**
   * Create a new Choreo
   *
   * @param {string} name - Name of the choreography.
   * @param {number} counts - Number of counts in the choreography.
   * @param {MatType} [matType='cheer'] - Type of mat used.
   * @param {UUID} SeasonTeamId - The season team UUID.
   * @param {Member} participants - List of participants.
   * @param {UUID|null} ownerId - Owner ID. If null/undefined, falls back to actingUserId
   * @param {UUID} actingUserId - The acting user's UUID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Choreo>} The created choreography.
   */
  async create(
    name: string,
    counts: number,
    matType: MatType = defaultMatType,
    SeasonTeamId: string,
    participants: { id: string; color?: string }[],
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ChoreoService create ${JSON.stringify({
        name,
        counts,
        matType,
        SeasonTeamId,
        participants,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return Choreo.create({
      name,
      counts,
      matType,
      SeasonTeamId,
      UserId: ownerId,
      creatorId: actingUserId,
      updaterId: actingUserId,
    }).then((choreo) =>
      Promise.all(
        participants.map((p) =>
          this.addParticipant(choreo.id, p.id, actingUserId, isAdmin, p.color),
        ),
      ).then(() => this.findById(choreo.id, actingUserId, isAdmin)),
    );
  }

  /**
   * Find or create a choreo.
   *
   * @param {string} name - Name of the choreography.
   * @param {number} counts - Number of counts in the choreography.
   * @param {MatType} [matType='cheer'] - Type of mat used.
   * @param {UUID} SeasonTeamId - The season team UUID.
   * @param {UUID|null} ownerId - Owner ID. If null/undefined, falls back to actingUserId
   * @param {UUID} actingUserId - The acting user's UUID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<Array<Choreo|boolean>>} The found or created choreography and a boolean indicating if the choreography was created.
   */
  async findOrCreate(
    name: string,
    counts: number,
    matType = defaultMatType,
    SeasonTeamId: string,
    ownerId: string,
    actingUserId: string,
    isAdmin = false,
  ): Promise<[Choreo, boolean]> {
    logger.debug(
      `ChoreoService findOrCreate ${JSON.stringify({
        name,
        counts,
        matType,
        SeasonTeamId,
        ownerId,
        actingUserId,
        isAdmin,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    const [choreo, created] = await Choreo.findOrCreate({
      where: { name, counts, matType, SeasonTeamId, UserId: ownerId },
      defaults: {
        name,
        counts,
        matType,
        SeasonTeamId,
        UserId: ownerId,
        creatorId: actingUserId,
        updaterId: actingUserId,
      },
    });
    return [choreo, created];
  }

  /**
   * Add a Participant to a Choreo
   *
   * @param {UUID} choreoId - The choreography's UUID.
   * @param {UUID} MemberId - The member's UUID.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @param {boolean} [isAdmin=false]
   * @param {string} [color=null] - Color associated with the participant.
   * @returns {Promise<void>}
   */
  async addParticipant(
    choreoId: string,
    MemberId: string,
    actingUserId: string,
    isAdmin = false,
    color: string | null = null,
  ) {
    // Inherit ownerId from parent Choreo
    const choreo = await this.findById(choreoId, actingUserId, isAdmin);
    if (!choreo) {
      throw new NotFoundError(`Choreo with ID ${choreoId} not found`);
    }
    const ownerId = choreo.UserId;

    await checkWriteAccess(ownerId, actingUserId, isAdmin);
    logger.debug(
      `ChoreoService addParticipant ${JSON.stringify({
        choreoId,
        MemberId,
        ownerId,
        actingUserId,
        isAdmin,
        color,
      })}`,
    );

    await checkWriteAccess(ownerId, actingUserId, isAdmin);

    return this.findById(choreoId, actingUserId, isAdmin).then(
      async (choreo) => {
        if (!choreo) {
          throw new NotFoundError(`Choreo with ID ${choreoId} not found`);
        }
        return MemberService.findById(MemberId, actingUserId, isAdmin).then(
          async (member) => {
            if (!member) {
              logger.error(`Member with ID ${MemberId} not found`);
              throw new NotFoundError(`Member with ID ${MemberId} not found`);
            }
            await choreo.addParticipant(member, {
              through: {
                color:
                  color ||
                  defaultColors[
                    Math.floor(Math.random() * defaultColors.length)
                  ],
              },
            });
            return this.update(choreoId, {}, actingUserId, isAdmin);
          },
        );
      },
    );
  }

  /**
   * Remove a Participant from a Choreo
   *
   * @param {UUID} ChoreoId - The choreography's UUID.
   * @param {UUID} MemberId - The member's UUID.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<void>}
   */
  async removeParticipant(
    ChoreoId: string,
    MemberId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ChoreoService removeParticipant ${JSON.stringify({
        ChoreoId,
        MemberId,
        actingUserId,
        isAdmin,
      })}`,
    );

    return ChoreoParticipation.findOne({
      where: { MemberId, ChoreoId },
      include: { association: "Choreo" },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation: ChoreoParticipation | null) => {
        if (!foundChoreoParticipation) return;
        await checkWriteAccess(
          foundChoreoParticipation.Choreo.UserId,
          actingUserId,
          isAdmin,
        );
        const choreoIdVar = foundChoreoParticipation.ChoreoId;
        await foundChoreoParticipation.destroy();
        await this.update(choreoIdVar, {}, actingUserId, isAdmin);
      });
  }

  /**
   * Switch Member's Participation with another Member
   *
   * @param {UUID} ChoreoId - The choreography's UUID.
   * @param {UUID} memberToAddId - The UUID of the member to add.
   * @param {UUID} memberToRemoveId - The UUID of the member to remove.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<void>}
   */
  async replaceParticipant(
    ChoreoId: string,
    memberToAddId: string,
    memberToRemoveId: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ChoreoService replaceParticipant ${JSON.stringify({
        ChoreoId,
        memberToAddId,
        memberToRemoveId,
        actingUserId,
        isAdmin,
      })}`,
    );

    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: memberToRemoveId },
      include: { association: "Choreo" },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation: ChoreoParticipation | null) => {
        if (!foundChoreoParticipation) {
          logger.error(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${memberToRemoveId} not found`,
          );
          throw new NotFoundError(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${memberToRemoveId} not found`,
          );
        }
        const color = foundChoreoParticipation.color;
        const ownerId = foundChoreoParticipation.Choreo.UserId;
        await checkWriteAccess(ownerId, actingUserId, isAdmin);
        await this.removeParticipant(
          ChoreoId,
          memberToRemoveId,
          actingUserId,
          isAdmin,
        );
        await this.addParticipant(
          ChoreoId,
          memberToAddId,
          actingUserId,
          isAdmin,
          color,
        );

        await Promise.all([
          Position.findAll({
            where: { UserId: ownerId, MemberId: memberToRemoveId },
          }).then((positionList: Position[]) =>
            Promise.all(
              positionList.map((position) => position.setMember(memberToAddId)),
            ),
          ),
          Hit.findAll({
            where: { ChoreoId, UserId: ownerId },
            include: "Members",
          }).then((hitList: Hit[]) => {
            hitList = hitList.filter((hit) =>
              hit.Members.some((m: Member) => m.id == memberToRemoveId),
            );
            return Promise.all(
              hitList.map(async (hit) =>
                Promise.all([
                  hit.removeMember(memberToRemoveId),
                  hit.addMember(memberToAddId),
                ]),
              ),
            );
          }),
        ]);

        return this.findById(ChoreoId, actingUserId, isAdmin);
      });
  }

  /**
   * Change the color of a Participant in a Choreo
   *
   * @param {UUID} ChoreoId - The choreography's UUID.
   * @param {UUID} participantId - The participant's UUID.
   * @param {string} color - New color for the participant.
   * @param {UUID} actingUserId - The acting user's UUID.
   * @param {boolean} [isAdmin=false]
   * @returns {Promise<void>}
   */
  changeParticipationColor(
    ChoreoId: string,
    participantId: string,
    color: string,
    actingUserId: string,
    isAdmin = false,
  ) {
    logger.debug(
      `ChoreoService changeParticipationColor ${JSON.stringify({
        ChoreoId,
        participantId,
        color,
        actingUserId,
        isAdmin,
      })}`,
    );

    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: participantId },
      include: { association: "Choreo" },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation: ChoreoParticipation | null) => {
        if (!foundChoreoParticipation) {
          logger.error(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${participantId} not found`,
          );
          throw new NotFoundError(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${participantId} not found`,
          );
        }
        await checkWriteAccess(
          foundChoreoParticipation.Choreo.UserId,
          actingUserId,
          isAdmin,
        );
        await foundChoreoParticipation.update({ color });
        await foundChoreoParticipation.save();
        return this.update(ChoreoId, {}, actingUserId, isAdmin);
      });
  }

  /**
   * Update a choreo.
   * @param {UUID} id - The choreo ID.
   * @param {Object} data - The data to update.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {Boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<Choreo>} The updated choreography.
   */
  async update(
    id: string,
    data: object,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ChoreoService update ${JSON.stringify({ id, data, actingUserId, isAdmin, options })}`,
    );

    const foundChoreo = await Choreo.findByPk(id);
    if (!foundChoreo) {
      logger.error(`No choreo found with ID ${id} when updating`);
      throw new NotFoundError(`No choreo found with ID ${id} when updating`);
    }

    await checkWriteAccess(foundChoreo.UserId, actingUserId, isAdmin);

    await foundChoreo.update({
      ...data,
      updaterId: actingUserId,
    });
    await foundChoreo.save();
    return this.findById(id, actingUserId, isAdmin, options);
  }

  /**
   * Remove a Choreo
   *
   * @param {UUID} id - The choreography's UUID.
   * @param {UUID} actingUserId - The acting user ID.
   * @param {boolean} [isAdmin=false]
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<void>}
   */
  async remove(
    id: string,
    actingUserId: string,
    isAdmin = false,
    options = { all: false },
  ) {
    logger.debug(
      `ChoreoService remove ${JSON.stringify({ id, actingUserId, isAdmin, options })}`,
    );

    const foundChoreo = await Choreo.findByPk(id);
    if (!foundChoreo) {
      logger.error(`No choreo found with ID ${id} when deleting`);
      throw new NotFoundError(`No choreo found with ID ${id} when deleting`);
    }

    await checkDeleteAccess(foundChoreo.UserId, actingUserId, isAdmin);

    return foundChoreo.destroy();
  }

  async migrateCreatorUpdater() {
    logger.debug(`ChoreoService migrateCreatorUpdater`);

    const choreos = await Choreo.findAll({
      where: { creatorId: { [Op.is]: null }, UserId: { [Op.not]: null } },
    });

    await Promise.all(
      choreos.map((choreo) =>
        choreo.update({ creatorId: choreo.UserId, updaterId: choreo.UserId }),
      ),
    );
  }
}

export default new ChoreoService();
