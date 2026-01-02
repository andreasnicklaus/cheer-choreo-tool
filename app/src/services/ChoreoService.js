import { debug } from "@/utils/logging";
import ax from "./RequestService";
import i18n from "@/plugins/vue-i18n";

/**
 * Service for managing choreographies, participants, and positions.
 *
 * @class ChoreoService
 */
class ChoreoService {
  /**
   * Get mat type options for choreography creation.
   * @returns {Array} Array of mat type option objects
   */
  matTypeOptions = () => [
    {
      label: i18n.t("matTypeOptions.by-sport"),
      options: [
        { value: "cheer", text: i18n.t("matTypeOptions.descriptions.cheer") },
      ],
    },
    {
      label: i18n.t("matTypeOptions.by-stage"),
      options: [
        { value: "square", text: i18n.t("matTypeOptions.descriptions.square") },
        { value: "1:2", text: i18n.t("matTypeOptions.descriptions.1-2") },
        { value: "3:4", text: i18n.t("matTypeOptions.descriptions.3-4") },
      ],
    },
  ];

  /**
   * Get all choreographies for a team.
   * @param {string} teamId - ID of the team
   * @returns {Promise<Array>} Array of choreographies
   */
  getByTeam(teamId) {
    debug("Querying choreos with teamId", teamId);
    return ax.get("/choreo", { params: { teamId } }).then((res) => {
      debug("Successfully queried team");
      return res.data;
    });
  }

  /**
   * Get a choreography by its ID.
   * @param {string} choreoId - ID of the choreography
   * @returns {Promise<Object>} Choreography object
   */
  getById(choreoId) {
    debug("Querying choreo by id", choreoId);
    return ax.get(`/choreo/${choreoId}`).then((res) => {
      debug("Successfully queried choreo");
      return res.data;
    });
  }

  /**
   * Change the name of a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {string} name - New name for the choreography
   * @returns {Promise<Object>} Updated choreography
   */
  changeName(choreoId, name) {
    debug(`Changing the name of choreo ${choreoId} to ${name}`);
    return ax.put(`/choreo/${choreoId}`, { name }).then((res) => {
      debug("Successfully changed the name of the choreo", name);
      return res.data;
    });
  }

  /**
   * Change the length (counts) of a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {number} counts - New length in counts
   * @returns {Promise<Object>} Updated choreography
   */
  changeLength(choreoId, counts) {
    debug(`Changing the length of choreo ${choreoId} to ${counts}`);
    return ax.put(`/choreo/${choreoId}`, { counts }).then((res) => {
      debug("Successfully changed the length of choreo", choreoId);
      return res.data;
    });
  }

  /**
   * Change the mat type of a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {string} matType - New mat type
   * @returns {Promise<Object>} Updated choreography
   */
  changeMatType(choreoId, matType) {
    debug(`Changing the mat type of choreo ${choreoId} to ${matType}`);
    return ax.put(`/choreo/${choreoId}`, { matType }).then((res) => {
      debug("Successfully changed the mat type of choreo", choreoId);
      return res.data;
    });
  }

  /**
   * Add a participant to a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {string} MemberId - ID of the member to add
   * @param {string} color - Color for the participant
   * @returns {Promise<Object>} Added participant
   */
  addParticipant(choreoId, MemberId, color) {
    debug(
      `Adding participant ${MemberId} to choreo ${choreoId} with color ${color}`
    );
    return ax
      .post(`/choreo/${choreoId}/participants`, { MemberId, color })
      .then((res) => {
        debug("Successfully added participant to choreo");
        return res.data;
      });
  }

  /**
   * Remove a participant from a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {string} MemberId - ID of the member to remove
   * @returns {Promise}
   */
  removeParticipant(choreoId, MemberId) {
    debug(`Removing participant ${MemberId} from choreo ${choreoId}`);
    return ax.delete(`/choreo/${choreoId}/participants/${MemberId}`);
  }

  /**
   * Replace a participant in a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {string} memberToRemoveId - ID of the member to remove
   * @param {string} memberToAddId - ID of the member to add
   * @returns {Promise<Object>} Updated participant list
   */
  replaceParticipant(choreoId, memberToRemoveId, memberToAddId) {
    debug(
      `Replacing participant ${memberToRemoveId} for ${memberToAddId} in choreo ${choreoId}`
    );
    return ax
      .patch(`/choreo/${choreoId}/participants`, {
        memberToRemoveId,
        memberToAddId,
      })
      .then((res) => {
        debug("Successfully replaced participant");
        return res.data;
      });
  }

  /**
   * Change the color of a participant in a choreography.
   * @param {string} choreoId - ID of the choreography
   * @param {string} participantId - ID of the participant
   * @param {string} color - New color for the participant
   * @returns {Promise<Object>} Updated participant
   */
  changeParticipantColor(choreoId, participantId, color) {
    debug(`Changing participant color with`, {
      choreoId,
      participantId,
      color,
    });
    return ax
      .patch(`/choreo/${choreoId}/participants/${participantId}`, { color })
      .then((res) => {
        debug("Successfully changed participant color");
        return res.data;
      });
  }

  /**
   * Create a new choreography.
   * @param {string} name - Name of the choreography
   * @param {number} counts - Length of the choreography in counts
   * @param {string} matType - Mat type for the choreography
   * @param {string} seasonTeamId - ID of the season team
   * @param {Array} participants - Array of participant objects
   * @returns {Promise<Object>} Created choreography
   */
  create(name, counts, matType, seasonTeamId, participants) {
    debug("Creating choreo", {
      name,
      counts,
      matType,
      seasonTeamId,
      participants,
    });
    return ax
      .post("/choreo", { name, counts, matType, seasonTeamId, participants })
      .then((res) => {
        debug("Successfully created choreo");
        return res.data;
      });
  }

  /**
   * Remove a choreography by its ID.
   * @param {string} choreoId - ID of the choreography to remove
   * @returns {Promise}
   */
  remove(choreoId) {
    debug("Deleting choreo", choreoId);
    return ax.delete(`/choreo/${choreoId}`).then((res) => {
      debug("Successfully deleted choreo");
      return res.data;
    });
  }

  /**
   * Get positions for all team members for a given count in a choreography.
   * @param {Object} choreo - Choreography object
   * @param {number} count - Count for which to get positions
   * @param {Array} teamMembers - Array of team member objects
   * @returns {Array} Array of position objects
   */
  getPositionsFromChoreoAndCount(choreo, count, teamMembers) {
    if (!teamMembers || !choreo || !choreo.Lineups) return [];

    const relevantLineups = choreo.Lineups.filter(
      (l) =>
        l.Positions &&
        l.Positions.length > 0 &&
        l.startCount <= count &&
        l.endCount >= count
    );

    const positionsForCurrentCount = relevantLineups
      .map((l) => l.Positions)
      .flat();

    let unPositionedTeamMembers = teamMembers.filter(
      (m) => !positionsForCurrentCount.some((p) => p.MemberId == m.id)
    );

    const interpolatedPositions = [];
    unPositionedTeamMembers.forEach((member) => {
      const lineupsForMember = choreo.Lineups.filter(
        (l) => l.Positions && l.Positions.some((p) => p.MemberId == member.id)
      );

      const previousLineupForMember = lineupsForMember
        .filter((l) => l.endCount < count)
        .sort((a, b) => b.endCount - a.endCount)[0];

      const followingLineupForMember = lineupsForMember
        .filter((l) => l.startCount > count)
        .sort((a, b) => a.startCount - b.startCount)[0];

      const previousPositionForMember = previousLineupForMember
        ? previousLineupForMember.Positions.find((p) => p.MemberId == member.id)
        : null;
      const followingPositionForMember = followingLineupForMember
        ? followingLineupForMember.Positions.find(
            (p) => p.MemberId == member.id
          )
        : null;

      if (!previousPositionForMember && followingPositionForMember)
        interpolatedPositions.push(followingPositionForMember);
      else if (previousPositionForMember && !followingPositionForMember)
        interpolatedPositions.push(previousPositionForMember);
      else if (previousPositionForMember && followingPositionForMember) {
        const countsSincePrevious = count - previousLineupForMember.endCount;
        const countsBetweenPreviousAndFollowing =
          followingLineupForMember.startCount -
          previousLineupForMember.endCount;

        const advancement =
          countsSincePrevious / countsBetweenPreviousAndFollowing;

        const interpolatedPositionForMember = {
          Member: member,
          MemberId: member.id,
          x:
            previousPositionForMember.x +
            (followingPositionForMember.x - previousPositionForMember.x) *
              advancement,
          y:
            previousPositionForMember.y +
            (followingPositionForMember.y - previousPositionForMember.y) *
              advancement,
        };

        interpolatedPositions.push(interpolatedPositionForMember);
      }
    });

    unPositionedTeamMembers = teamMembers.filter(
      (m) =>
        ![...positionsForCurrentCount, ...interpolatedPositions].some(
          (p) => p.MemberId == m.id
        )
    );

    const defaultPositions = unPositionedTeamMembers.map((member, i) => {
      let yNew = Math.floor(i / 7) * 10 + 10;
      let xNew = (100 / 7) * (i % 7) + 100 / 14;

      return {
        Member: member,
        MemberId: member.id,
        x: xNew,
        y: yNew,
      };
    });

    return [
      ...positionsForCurrentCount,
      ...interpolatedPositions,
      ...defaultPositions,
    ]
      .map((p) => ({
        ...p,
        Member: teamMembers.find((tm) => tm.id == p.MemberId),
      }))
      .sort((a, b) => a.Member.name.localeCompare(b.Member.name));
  }
}

export default new ChoreoService();
