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
   * @param {Array} memberIds - Array of member IDs to include in the team
   * @returns {Promise<Object>} Created season team
   */
  create(teamId, seasonId, memberIds) {
    return ax
      .post("/seasonTeam", { teamId, seasonId, memberIds })
      .then((res) => res.data);
  }

  /**
   * Import members into a season team.
   * @param {string} seasonTeamId - ID of the season team
   * @param {Array} memberIds - Array of member IDs to import
   * @returns {Promise<Object>} Updated season team
   */
  importMembers(seasonTeamId, memberIds) {
    return ax
      .put(`/seasonTeam/${seasonTeamId}`, { memberIds })
      .then((res) => res.data);
  }

  /**
   * Remove a season team by its ID.
   * @param {string} seasonTeamId - ID of the season team to remove
   * @returns {Promise<Object>} Response data
   */
  remove(seasonTeamId) {
    return ax.delete(`/seasonTeam/${seasonTeamId}`).then((res) => res.data);
  }
}

export default new SeasonTeamService();
