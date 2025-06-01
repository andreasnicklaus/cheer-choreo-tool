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
   * @param {string} teamId
   * @returns {Promise<Array>} Array of choreographies
   */
  getByTeam(teamId) {
    return ax.get("/choreo", { params: { teamId } }).then((res) => res.data);
  }

  /**
   * Get a choreography by its ID.
   * @param {string} choreoId
   * @returns {Promise<Object>} Choreography object
   */
  getById(choreoId) {
    return ax.get(`/choreo/${choreoId}`).then((res) => res.data);
  }

  /**
   * Change the name of a choreography.
   * @param {string} choreoId
   * @param {string} name
   * @returns {Promise<Object>} Updated choreography
   */
  changeName(choreoId, name) {
    return ax.put(`/choreo/${choreoId}`, { name }).then((res) => res.data);
  }

  /**
   * Change the length (counts) of a choreography.
   * @param {string} choreoId
   * @param {number} counts
   * @returns {Promise<Object>} Updated choreography
   */
  changeLength(choreoId, counts) {
    return ax.put(`/choreo/${choreoId}`, { counts }).then((res) => res.data);
  }

  /**
   * Change the mat type of a choreography.
   * @param {string} choreoId
   * @param {string} matType
   * @returns {Promise<Object>} Updated choreography
   */
  changeMatType(choreoId, matType) {
    return ax.put(`/choreo/${choreoId}`, { matType }).then((res) => res.data);
  }

  /**
   * Add a participant to a choreography.
   * @param {string} choreoId
   * @param {string} memberId
   * @param {string} color
   * @returns {Promise<Object>} Added participant
   */
  addParticipant(choreoId, memberId, color) {
    return ax
      .post(`/choreo/${choreoId}/participants`, { memberId, color })
      .then((res) => res.data);
  }

  /**
   * Remove a participant from a choreography.
   * @param {string} choreoId
   * @param {string} memberId
   * @returns {Promise}
   */
  removeParticipant(choreoId, memberId) {
    return ax.delete(`/choreo/${choreoId}/participants/${memberId}`);
  }

  /**
   * Replace a participant in a choreography.
   * @param {string} choreoId
   * @param {string} memberToRemoveId
   * @param {string} memberToAddId
   * @returns {Promise<Object>} Updated participant list
   */
  replaceParticipant(choreoId, memberToRemoveId, memberToAddId) {
    return ax
      .patch(`/choreo/${choreoId}/participants`, {
        memberToRemoveId,
        memberToAddId,
      })
      .then((res) => res.data);
  }

  /**
   * Change the color of a participant in a choreography.
   * @param {string} choreoId
   * @param {string} participantId
   * @param {string} color
   * @returns {Promise<Object>} Updated participant
   */
  changeParticipantColor(choreoId, participantId, color) {
    return ax
      .patch(`/choreo/${choreoId}/participants/${participantId}`, { color })
      .then((res) => res.data);
  }

  /**
   * Create a new choreography.
   * @param {string} name
   * @param {number} counts
   * @param {string} matType
   * @param {string} seasonTeamId
   * @param {Array} participants
   * @returns {Promise<Object>} Created choreography
   */
  create(name, counts, matType, seasonTeamId, participants) {
    return ax
      .post("/choreo", { name, counts, matType, seasonTeamId, participants })
      .then((res) => res.data);
  }

  /**
   * Remove a choreography by its ID.
   * @param {string} choreoId
   * @returns {Promise}
   */
  remove(choreoId) {
    return ax.delete(`/choreo/${choreoId}`).then((res) => res.data);
  }

  /**
   * Get positions for all team members for a given count in a choreography.
   * @param {Object} choreo
   * @param {number} count
   * @param {Array} teamMembers
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
