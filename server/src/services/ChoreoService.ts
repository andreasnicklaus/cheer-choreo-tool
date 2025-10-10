import Choreo, { defaultMatType, MatType } from "../db/models/choreo";
import ChoreoParticipation from "../db/models/choreoParticipation";
import Hit from "../db/models/hit";
import Lineup from "../db/models/lineup";
import Member from "../db/models/member";
import Position from "../db/models/position";
import LineupService from "./LineupService";
import MemberService from "./MemberService";
import PositionService from "./PositionService";

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
   * Get all Choreos with specified UserId
   *
   * @async
   * @param {UUID} UserId - The user's UUID.
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {Boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<Choreo[]>} List of choreographies.
   */
  async getAll(UserId: string, options = { all: false }) {
    logger.debug(`ChoreoService getAll ${JSON.stringify({ UserId, options })}`);
    return Choreo.findAll({
      where: options.all ? {} : { UserId },
      include: defaultInclude,
    });
  }

  /**
   * Find all Choreos with specified UserId and TeamId
   *
   * @async
   * @param {UUID} SeasonTeamId - The SeasonTeam's UUID.
   * @param {UUID} UserId - The user's UUID.
   * @returns {Promise<Choreo[]>} List of choreographies.
   */
  async findBySeasonTeamId(SeasonTeamId: string, UserId: string) {
    logger.debug(
      `ChoreoService findBySeasonTeamId ${JSON.stringify({
        SeasonTeamId,
        UserId,
      })}`,
    );
    return Choreo.findAll({
      where: { SeasonTeamId, UserId },
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
   * @async
   * @param {UUID} id - The choreography's UUID.
   * @param {UUID} UserId - The user's UUID.
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {Boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<Choreo>} The choreography.
   */
  async findById(id: string, UserId: string | null, options = { all: false }) {
    logger.debug(
      `ChoreoService findById ${JSON.stringify({ id, UserId, options })}`,
    );
    return Choreo.findOne({
      where: options.all ? { id } : UserId !== null ? { id, UserId } : { id },
      include: defaultInclude,
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (choreo: Choreo | null) => {
        if (!choreo) {
          logger.error(`Choreo with ID ${id} not found`);
          throw new Error(`Choreo with ID ${id} not found`);
        }
        const lineups = await LineupService.findByChoreoId(choreo.id);
        // Add Lineups property dynamically to dataValues
        (choreo.dataValues as { Lineups?: Lineup[] }).Lineups = lineups;
        await Promise.all(
          (choreo.dataValues as { Lineups?: Lineup[] }).Lineups!.map(
            async (lineup: Lineup) => {
              (lineup.dataValues as Record<string, unknown>).Positions =
                await PositionService.findByLineupId(lineup.id, UserId);
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
   * @async
   * @param {string} name - Name of the choreography.
   * @param {number} counts - Number of counts in the choreography.
   * @param {MatType} [matType='cheer'] - Type of mat used.
   * @param {UUID} SeasonTeamId - The season team UUID.
   * @param {Member} participants - List of participants.
   * @param {UUID} UserId - The user's UUID.
   * @returns {Promise<Choreo>} The created choreography.
   */
  async create(
    name: string,
    counts: number,
    matType: MatType = defaultMatType,
    SeasonTeamId: string,
    participants: { id: string; color?: string }[],
    UserId: string,
  ) {
    logger.debug(
      `ChoreoService create ${JSON.stringify({
        name,
        counts,
        matType,
        SeasonTeamId,
        participants,
        UserId,
      })}`,
    );
    return Choreo.create({
      name,
      counts,
      matType,
      SeasonTeamId,
      UserId,
    }).then((choreo) =>
      Promise.all(
        participants.map((p) =>
          this.addParticipant(choreo.id, p.id, UserId, p.color),
        ),
      ).then(() => this.findById(choreo.id, UserId)),
    );
  }

  /**
   * Find or create (if it does not exist) a Choreo
   *
   * @async
   * @param {string} name - Name of the choreography.
   * @param {number} counts - Number of counts in the choreography.
   * @param {MatType} [matType='cheer'] - Type of mat used.
   * @param {UUID} SeasonTeamId - The season team UUID.
   * @param {UUID} UserId - The user's UUID.
   * @returns {Promise<Choreo>} The found or created choreography.
   */
  async findOrCreate(
    name: string,
    counts: number,
    matType = defaultMatType,
    SeasonTeamId: string,
    UserId: string,
  ) {
    logger.debug(
      `ChoreoService findOrCreate ${JSON.stringify({
        name,
        counts,
        matType,
        SeasonTeamId,
        UserId,
      })}`,
    );
    const [choreo, _created] = await Choreo.findOrCreate({
      where: { name, counts, matType, SeasonTeamId, UserId },
    });
    return choreo;
  }

  /**
   * Add a Participant to a Choreo
   *
   * @async
   * @param {UUID} choreoId - The choreography's UUID.
   * @param {UUID} MemberId - The member's UUID.
   * @param {UUID} UserId - The user's UUID.
   * @param {string} [color=null] - Color associated with the participant.
   * @returns {Promise<void>}
   */
  async addParticipant(
    choreoId: string,
    MemberId: string,
    UserId: string,
    color: string | null = null,
  ) {
    logger.debug(
      `ChoreoService addParticipant ${JSON.stringify({
        choreoId,
        MemberId,
        UserId,
        color,
      })}`,
    );
    return this.findById(choreoId, UserId).then((choreo) =>
      MemberService.findById(MemberId, UserId).then((member) => {
        if (!member) {
          logger.error(`Member with ID ${MemberId} not found`);
          throw new Error(`Member with ID ${MemberId} not found`);
        }
        return choreo.addParticipant(member, {
          through: {
            color:
              color ||
              defaultColors[Math.floor(Math.random() * defaultColors.length)], // njsscan-ignore: node_insecure_random_generator
          },
        });
      }),
    );
  }

  /**
   * Remove a Participant from a Choreo
   *
   * @async
   * @param {UUID} ChoreoId - The choreography's UUID.
   * @param {UUID} MemberId - The member's UUID.
   * @returns {Promise<void>}
   */
  async removeParticipant(ChoreoId: string, MemberId: string) {
    logger.debug(
      `ChoreoService removeParticipant ${JSON.stringify({
        ChoreoId,
        MemberId,
      })}`,
    );
    return ChoreoParticipation.findOne({
      where: { MemberId, ChoreoId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundChoreoParticipation: ChoreoParticipation | null) => {
        if (!foundChoreoParticipation) return;
        return foundChoreoParticipation.destroy();
      });
  }

  /**
   * Switch Member's Participation with another Member
   *
   * @async
   * @param {UUID} ChoreoId - The choreography's UUID.
   * @param {UUID} memberToAddId - The UUID of the member to add.
   * @param {UUID} memberToRemoveId - The UUID of the member to remove.
   * @param {UUID} UserId - The user's UUID.
   * @returns {Promise<void>}
   */
  async replaceParticipant(
    ChoreoId: string,
    memberToAddId: string,
    memberToRemoveId: string,
    UserId: string,
  ) {
    logger.debug(
      `ChoreoService replaceParticipant ${JSON.stringify({
        ChoreoId,
        memberToAddId,
        memberToRemoveId,
        UserId,
      })}`,
    );
    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: memberToRemoveId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation: ChoreoParticipation | null) => {
        if (!foundChoreoParticipation) {
          logger.error(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${memberToRemoveId} not found`,
          );
          throw new Error(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${memberToRemoveId} not found`,
          );
        }
        const color = foundChoreoParticipation.color;
        await this.removeParticipant(ChoreoId, memberToRemoveId);
        await this.addParticipant(ChoreoId, memberToAddId, UserId, color);

        await Promise.all([
          // Update all Positions
          Position.findAll({
            where: { UserId, MemberId: memberToRemoveId },
          }).then((positionList: Position[]) =>
            Promise.all(
              positionList.map((position) => position.setMember(memberToAddId)),
            ),
          ),
          // Update all Hits
          Hit.findAll({
            where: { ChoreoId, UserId },
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

        return this.findById(ChoreoId, UserId);
      });
  }

  /**
   * Change the color of a Participant in a Choreo
   *
   * @param {UUID} ChoreoId - The choreography's UUID.
   * @param {UUID} participantId - The participant's UUID.
   * @param {string} color - New color for the participant.
   * @param {UUID} UserId - The user's UUID.
   * @returns {Promise<void>}
   */
  changeParticipationColor(
    ChoreoId: string,
    participantId: string,
    color: string,
  ) {
    logger.debug(
      `ChoreoService changeParticipationColor ${JSON.stringify({
        ChoreoId,
        participantId,
        color,
      })}`,
    );
    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: participantId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation: ChoreoParticipation | null) => {
        if (!foundChoreoParticipation) {
          logger.error(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${participantId} not found`,
          );
          throw new Error(
            `ChoreoParticipation with ChoreoId ${ChoreoId} and MemberId ${participantId} not found`,
          );
        }
        await foundChoreoParticipation.update({ color });
        return foundChoreoParticipation.save();
      });
  }

  /**
   * Update a choreo
   *
   * @async
   * @param {UUID} id - The choreography's UUID.
   * @param {Object} data - Data to update the choreography.
   * @param {UUID} UserId - The user's UUID.
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {Boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<Choreo>} The updated choreography.
   */
  async update(
    id: string,
    data: object,
    UserId: string | null,
    options = { all: false },
  ) {
    logger.debug(
      `ChoreoService update ${JSON.stringify({ id, data, UserId, options })}`,
    );
    return Choreo.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreo) => {
        if (foundChoreo) {
          await foundChoreo.update(data);
          await foundChoreo.save();
          return this.findById(id, UserId, options);
        } else {
          logger.error(`No choreo found with ID ${id} when updating`);
          throw new Error(`No choreo found with ID ${id} when updating`);
        }
      });
  }

  /**
   * Remove a Choreo
   *
   * @async
   * @param {UUID} id - The choreography's UUID.
   * @param {UUID} UserId - The user's UUID.
   * @param {Object} [options={ all: false }] - Options for the query.
   * @param {Boolean} [options.all=false] - Whether to fetch all choreographies.
   * @returns {Promise<void>}
   */
  async remove(id: string, UserId: string | null, options = { all: false }) {
    logger.debug(
      `ChoreoService remove ${JSON.stringify({ id, UserId, options })}`,
    );
    return Choreo.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreo) => {
        if (foundChoreo) {
          return foundChoreo.destroy();
        } else {
          logger.error(`No choreo found with ID ${id} when deleting`);
          throw new Error(`No choreo found with ID ${id} when deleting`);
        }
      });
  }
}

export default new ChoreoService();
