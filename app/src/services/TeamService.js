import ax from "./RequestService";

/**
 * Service for managing teams and their data.
 * @class TeamService
 */
class TeamService {
  /**
   * Get all teams.
   * @returns {Promise<Array>} Array of team objects
   */
  getAll() {
    return ax.get("/team").then((res) => res.data);
  }

  /**
   * Get teams by name.
   * @param {string} name
   * @returns {Promise<Array>} Array of team objects
   */
  getByName(name) {
    return ax.get("/team", { params: { name } }).then((res) => res.data);
  }

  /**
   * Get a team by its ID.
   * @param {string} teamId
   * @returns {Promise<Object>} Team object
   */
  getById(teamId) {
    return ax.get(`/team/${teamId}`).then((res) => res.data);
  }

  /**
   * Create a new team.
   * @param {string} name
   * @param {string} clubId
   * @param {string} seasonId
   * @returns {Promise<Object>} Created team
   */
  create(name, clubId, seasonId) {
    return ax.post("/team", { name, clubId, seasonId }).then((res) => res.data);
  }

  /**
   * Set the name of a team.
   * @param {string} teamId
   * @param {string} name
   * @returns {Promise<Object>} Updated team
   */
  setName(teamId, name) {
    return ax.put(`/team/${teamId}`, { name }).then((res) => res.data);
  }

  /**
   * Remove a team by its ID.
   * @param {string} teamId
   * @returns {Promise<Object>} Response data
   */
  remove(teamId) {
    return ax.delete(`/team/${teamId}`).then((res) => res.data);
  }
}

export default new TeamService();
