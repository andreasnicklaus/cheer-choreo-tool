import { debug } from "@/utils/logging";
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
   * @param {string} name - Name of the team to search for
   * @returns {Promise<Array>} Array of team objects
   */
  getByName(name) {
    debug("Querying teams by name", name);
    return ax.get("/team", { params: { name } }).then((res) => {
      debug("Successfully queried teams by name");
      return res.data;
    });
  }

  /**
   * Get a team by its ID.
   * @param {string} teamId - ID of the team
   * @returns {Promise<Object>} Team object
   */
  getById(teamId) {
    debug("Querying team by id", teamId);
    return ax.get(`/team/${teamId}`).then((res) => {
      debug("Successfully queried team by id");
      return res.data;
    });
  }

  /**
   * Create a new team.
   * @param {string} name - Name of the team to create
   * @param {string} clubId - ID of the club the team belongs to
   * @param {string} seasonId - ID of the season the team is in
   * @returns {Promise<Object>} Created team
   */
  create(name, clubId, seasonId) {
    debug("Creating a new team", { clubId, name, seasonId });
    return ax.post("/team", { name, clubId, seasonId }).then((res) => {
      debug("Successfully created team");
      return res.data;
    });
  }

  /**
   * Set the name of a team.
   * @param {string} teamId - ID of the team to update
   * @param {string} name - New name for the team
   * @returns {Promise<Object>} Updated team
   */
  setName(teamId, name) {
    debug("Setting team's name", { teamId, name });
    return ax.put(`/team/${teamId}`, { name }).then((res) => {
      debug("Successfully updated team's name");
      return res.data;
    });
  }

  /**
   * Remove a team by its ID.
   * @param {string} teamId - ID of the team to remove
   * @returns {Promise<Object>} Response data
   */
  remove(teamId) {
    debug("Removing team", teamId);
    return ax.delete(`/team/${teamId}`).then((res) => {
      debug("Successfully deleted team");
      return res.data;
    });
  }
}

export default new TeamService();
