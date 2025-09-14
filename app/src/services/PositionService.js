import { debug } from "@/utils/logging";
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
   * @param {string} MemberId - ID of the member for this position
   * @returns {Promise<Object>} Created position
   */
  create(lineupId, x, y, MemberId) {
    debug("Creating new position", { lineupId, x, y, MemberId });
    return ax
      .post(`/lineup/${lineupId}/position`, { x, y, MemberId })
      .then((res) => {
        debug("Successfully created position");
        return res.data;
      });
  }

  /**
   * Get all positions for a lineup.
   * @param {string} lineupId - ID of the lineup
   * @returns {Promise<Array>} Array of position objects
   */
  getByLineupId(lineupId) {
    debug("Querying positions by lineup", lineupId);
    return ax.get(`/position`, { params: { lineupId } }).then((res) => {
      debug("Successfully queried positions by lineup");
      return res.data;
    });
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
    debug("Updating position", { lineupId, positionId, x, y });
    return ax
      .put(`/lineup/${lineupId}/position/${positionId}`, { x, y })
      .then((res) => {
        debug("Successfully updated position");
        return res.data;
      });
  }

  /**
   * Remove a position by its ID.
   * @param {string} positionId - ID of the position to remove
   * @returns {Promise<Object>} Response data
   */
  remove(positionId) {
    debug("Deleting position", positionId);
    return ax.delete(`/position/${positionId}`).then((res) => {
      debug("Successfully deleted position");
      return res.data;
    });
  }
}

export default new PositionService();
