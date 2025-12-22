import { debug } from "@/utils/logging";
import ax from "./RequestService";

/**
 * Service for managing lineups in a choreography.
 * @class LineupService
 */
class LineupService {
  /**
   * Create a new lineup.
   * @param {number} startCount - Start count for the lineup
   * @param {number} endCount - End count for the lineup
   * @param {string} choreoId - Choreography ID
   * @returns {Promise<Object>} Created lineup
   */
  create(startCount, endCount, choreoId) {
    debug("Creating a new lineup", { startCount, endCount, choreoId });
    return ax
      .post(`/lineup`, { startCount, endCount, choreoId })
      .then((res) => {
        debug("Successfully created new lineup");
        return res.data;
      });
  }

  /**
   * Update a lineup by its ID.
   * @param {string} id - Lineup ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated lineup
   */
  update(id, data) {
    debug("Updating lineup", { id, data });
    return ax.put(`/lineup/${id}`, data).then((res) => {
      debug("Successfully updated lineup");
      return res.data;
    });
  }

  /**
   * Remove a lineup by its ID.
   * @param {string} id - Lineup ID
   * @returns {Promise<Object>} Response data
   */
  remove(id) {
    debug("Deleting lineup", id);
    return ax.delete(`/lineup/${id}`).then((res) => {
      debug("Successfully deleted lineup");
      return res.data;
    });
  }

  filterRejectedProposals(proposals, rejectedPositionProposals) {
    function isProposalNotRejected(proposal) {
      const alreadyRejected = rejectedPositionProposals.some(
        (rejectedProposal) => {
          return proposal.every((p) =>
            rejectedProposal.some(
              (rp) => Math.abs(rp.x - p.x) < 1 && Math.abs(rp.y - p.y) < 1
            )
          );
        }
      );

      return !alreadyRejected;
    }

    if (Array.isArray(proposals[0]))
      return proposals.filter((proposal) => isProposalNotRejected(proposal));
    else return isProposalNotRejected(proposals) ? proposals : [];
  }

  proposeLineup(teamMembers, rejectedPositionProposals) {
    function createLinePositions(members, lineNumber = 0) {
      const spacing = 100 / 7;
      const ySpacing = spacing / 2;
      let leftPadding = 50 + spacing / 2 - (spacing * members.length) / 2;
      return members.map((member, index) => ({
        MemberId: member.id,
        Member: member,
        x: leftPadding + index * spacing,
        y: 40 + lineNumber * ySpacing,
      }));
    }

    function getLinesForNumberOfMembers(n) {
      switch (n) {
        case 8:
          return [3, 2, 3];
        case 9:
          return [5, 4];
        case 10:
          return [4, 3, 2, 1];
        case 11:
          return [6, 5];
        case 12:
          return [5, 4, 3];
        case 13:
          return [4, 5, 4];
        case 14:
          return [5, 4, 3, 2];
        case 15:
          return [5, 4, 3, 2, 1];
        case 16:
          return [5, 6, 5];
        case 17:
          return [6, 5, 6];
        case 18:
          return [6, 5, 4, 3];
        case 19:
          return [4, 5, 4, 3, 2, 1];
        case 20:
          return [6, 5, 4, 3, 2];
        case 21:
          return [6, 5, 4, 3, 2, 1];
        case 22:
          return [7, 6, 5, 4];
        case 23:
          return [5, 4, 5, 4, 5];
        case 24:
          return [4, 5, 6, 5, 4];
        case 25:
          return [7, 6, 5, 4, 3];
      }
    }

    if (teamMembers.length === 0 || teamMembers.length === 1) {
      return [];
    } else if (teamMembers.length > 0 && teamMembers.length <= 7) {
      return this.filterRejectedProposals(
        createLinePositions(teamMembers),
        rejectedPositionProposals
      );
    } else if (teamMembers.length > 7 && teamMembers.length <= 25) {
      let lines = getLinesForNumberOfMembers(teamMembers.length);
      if (
        lines.reduce((partialSum, a) => partialSum + a, 0) != teamMembers.length
      ) {
        throw Error(
          "Sum of participants per line must equal the total number of participants"
        );
      }

      const linePositions = lines.map((lineLength, lineNumber) => {
        const startIndex = lines
          .slice(0, lineNumber)
          .reduce((partialSum, a) => partialSum + a, 0);

        return createLinePositions(
          teamMembers.slice(startIndex, startIndex + lineLength),
          lineNumber
        );
      });
      return this.filterRejectedProposals(
        linePositions.flat(),
        rejectedPositionProposals
      );
    }
    return [];
  }
}

export default new LineupService();
