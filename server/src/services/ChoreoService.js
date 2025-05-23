const Choreo = require("../db/models/choreo");
const { logger } = require("../plugins/winston");
const PositionService = require("./PositionService");
const LineupService = require("./LineupService");
const ChoreoParticipation = require("../db/models/choreoParticipation");
const Position = require("../db/models/position");
const Hit = require("../db/models/hit");
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
    include: ["Members", "Season", "Team"],
  },
  {
    association: "Hits",
    include: "Members",
  },
  "Participants",
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
  async getAll(UserId, options = { all: false }) {
    return Choreo.findAll({
      where: options.all ? {} : { UserId },
      include: defaultInclude,
    });
  }

  /**
   * Find all Choreos with specified UserId and TeamId
   *
   * @async
   * @param {UUID} TeamId - The team's UUID.
   * @param {UUID} UserId - The user's UUID.
   * @returns {Promise<Choreo[]>} List of choreographies.
   */
  async findByTeamId(TeamId, UserId) {
    return Choreo.findAll({
      where: { TeamId, UserId },
      include: defaultInclude,
    });
  }

  /**
   * Get the number of Choreos in the DB
   *
   * @returns {Promise<number>} Count of choreographies.
   */
  getCount() {
    return Choreo.count();
  }

  /**
   * Get the number of new Choreos minus the number of deleted Choreos in the last 30 days
   *
   * @returns {Promise<number>} Trend of choreographies.
   */
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
  async findById(id, UserId, options = { all: false }) {
    return Choreo.findOne({
      where: options.all ? { id } : { id, UserId },
      include: defaultInclude,
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (choreo) => {
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
    name,
    counts,
    matType = Choreo.rawAttributes.matType.defaultValue,
    SeasonTeamId,
    participants,
    UserId
  ) {
    logger.debug(
      `ChoreoService.create ${JSON.stringify({
        name,
        counts,
        matType,
        SeasonTeamId,
        participants,
        UserId,
      })}`
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
          this.addParticipant(choreo.id, p.id, UserId, p.color)
        )
      ).then(() => this.findById(choreo.id, UserId))
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
    name,
    counts,
    matType = Choreo.rawAttributes.matType.defaultValue,
    SeasonTeamId,
    UserId
  ) {
    logger.debug(
      `ChoreoService.findOrCreate ${JSON.stringify({
        name,
        counts,
        matType,
        SeasonTeamId,
        UserId,
      })}`
    );
    const [choreo, created] = await Choreo.findOrCreate({
      where: { name, counts, matType, SeasonTeamId, UserId },
    });
    return choreo;
  }

  /**
   * Add a Participant to a Choreo
   *
   * @async
   * @param {UUID} choreoId - The choreography's UUID.
   * @param {UUID} memberId - The member's UUID.
   * @param {UUID} UserId - The user's UUID.
   * @param {string} [color=null] - Color associated with the participant.
   * @returns {Promise<void>}
   */
  async addParticipant(choreoId, memberId, UserId, color = null) {
    return this.findById(choreoId, UserId).then((choreo) =>
      choreo.addParticipant(memberId, {
        through: {
          color:
            color ||
            defaultColors[Math.floor(Math.random() * defaultColors.length)], // njsscan-ignore: node_insecure_random_generator
        },
      })
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
  async removeParticipant(ChoreoId, MemberId) {
    return ChoreoParticipation.findOne({
      where: { MemberId, ChoreoId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundChoreoParticipation) => {
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
  async replaceParticipant(ChoreoId, memberToAddId, memberToRemoveId, UserId) {
    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: memberToRemoveId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation) => {
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
          Hit.findAll({
            where: { ChoreoId, UserId },
            include: "Members",
          }).then((hitList) => {
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
  changeParticipationColor(ChoreoId, participantId, color, UserId) {
    return ChoreoParticipation.findOne({
      where: { ChoreoId, MemberId: participantId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreoParticipation) => {
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
  async update(id, data, UserId, options = { all: false }) {
    return Choreo.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreo) => {
        if (foundChoreo) {
          logger.debug(
            `ChoreoService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundChoreo.update(data);
          await foundChoreo.save();
          return this.findById(id, UserId, options);
        } else {
          throw new Error(
            `Beim Update wurde keine Choreo mit der ID ${id} gefunden`
          );
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
  async remove(id, UserId, options = { all: false }) {
    return Choreo.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then(async (foundChoreo) => {
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
      });
  }
}

module.exports = new ChoreoService();
