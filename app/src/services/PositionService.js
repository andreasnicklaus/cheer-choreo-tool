import ax from "./RequestService";

/**
 * Service for managing positions in a lineup.
 * @class PositionService
 */
class PositionService {
  /**
   * Create a new position in a lineup.
   * @param {string} lineupId - ID of the lineup
   * @param {number} x - X coordinate of the position
   * @param {number} y - Y coordinate of the position
   * @param {string} memberId - ID of the member for this position
   * @returns {Promise<Object>} Created position
   */
  create(lineupId, x, y, memberId) {
    return ax
      .post(`/lineup/${lineupId}/position`, { x, y, memberId })
      .then((res) => res.data);
  }

  /**
   * Get all positions for a lineup.
   * @param {string} lineupId - ID of the lineup
   * @returns {Promise<Array>} Array of position objects
   */
  getByLineupId(lineupId) {
    return ax
      .get(`/position`, { params: { lineupId } })
      .then((res) => res.data);
  }

  /**
   * Update a position in a lineup.
   * @param {string} lineupId - ID of the lineup
   * @param {string} positionId - ID of the position to update
   * @param {number} x - X coordinate of the position
   * @param {number} y - Y coordinate of the position
   * @returns {Promise<Object>} Updated position
   */
  update(lineupId, positionId, x, y) {
    return ax
      .put(`/lineup/${lineupId}/position/${positionId}`, { x, y })
      .then((res) => res.data);
  }

  /**
   * Remove a position by its ID.
   * @param {string} positionId - ID of the position to remove
   * @returns {Promise<Object>} Response data
   */
  remove(positionId) {
    return ax.delete(`/position/${positionId}`).then((res) => res.data);
  }
}

export default new PositionService();
