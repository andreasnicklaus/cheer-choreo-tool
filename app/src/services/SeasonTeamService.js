import { debug } from "@/utils/logging";
import ax from "./RequestService";

/**
 * Service for managing season teams and their members.
 * @class SeasonTeamService
 */
class SeasonTeamService {
  /**
   * Create a new season team.
   * @param {string} teamId - ID of the team
   * @param {string} seasonId - ID of the season
   * @param {Array} MemberIds - Array of member IDs to include in the team
   * @returns {Promise<Object>} Created season team
   */
  create(teamId, seasonId, MemberIds) {
    debug("Creating a new seasonTeam", { teamId, seasonId, MemberIds });
    return ax
      .post("/seasonTeam", { teamId, seasonId, MemberIds })
      .then((res) => {
        debug("Successfully created a seasonTeam");
        return res.data;
      });
  }

  /**
   * Import members into a season team.
   * @param {string} seasonTeamId - ID of the season team
   * @param {Array} MemberIds - Array of member IDs to import
   * @returns {Promise<Object>} Updated season team
   */
  importMembers(seasonTeamId, MemberIds) {
    debug("Importing members", { seasonTeamId, MemberIds });
    return ax.put(`/seasonTeam/${seasonTeamId}`, { MemberIds }).then((res) => {
      debug("Successfully imported members");
      return res.data;
    });
  }

  /**
   * Remove a season team by its ID.
   * @param {string} seasonTeamId - ID of the season team to remove
   * @returns {Promise<Object>} Response data
   */
  remove(seasonTeamId) {
    debug("Removing seasonTeam", seasonTeamId);
    return ax.delete(`/seasonTeam/${seasonTeamId}`).then((res) => {
      debug("Successfully deleted seasonTeam");
      return res.data;
    });
  }
}

export default new SeasonTeamService();
