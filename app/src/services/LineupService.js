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
    return ax
      .post(`/lineup`, { startCount, endCount, choreoId })
      .then((res) => res.data);
  }

  /**
   * Update a lineup by its ID.
   * @param {string} id - Lineup ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated lineup
   */
  update(id, data) {
    return ax.put(`/lineup/${id}`, data).then((res) => res.data);
  }

  /**
   * Remove a lineup by its ID.
   * @param {string} id - Lineup ID
   * @returns {Promise<Object>} Response data
   */
  remove(id) {
    return ax.delete(`/lineup/${id}`).then((res) => res.data);
  }
}

export default new LineupService();
