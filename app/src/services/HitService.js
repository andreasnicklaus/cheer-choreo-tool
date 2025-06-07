import ax from "./RequestService";

/**
 * Service for managing hits in a choreography.
 * @class HitService
 */
class HitService {
  /**
   * Create a new hit.
   * @param {string} name - Name of the hit
   * @param {number} count - Count for the hit
   * @param {string} choreoId - Choreography ID
   * @param {Array} memberIds - Array of member IDs
   * @returns {Promise<Object>} Created hit
   */
  create(name, count, choreoId, memberIds = []) {
    return ax
      .post("/hit", { name, count, choreoId, memberIds })
      .then((res) => res.data);
  }

  /**
   * Set the count for a hit.
   * @param {string} hitId - Hit ID
   * @param {number} count - New count
   * @returns {Promise<Object>} Updated hit
   */
  setCount(hitId, count) {
    return ax.put(`/hit/${hitId}`, { count }).then((res) => res.data);
  }

  /**
   * Update a hit's details.
   * @param {string} hitId - Hit ID
   * @param {string} name - Name of the hit
   * @param {number} count - Count for the hit
   * @param {Array} MemberIds - Array of member IDs
   * @returns {Promise<Object>} Updated hit
   */
  update(hitId, name, count, MemberIds) {
    return ax
      .put(`/hit/${hitId}`, {
        name,
        count,
        MemberIds,
      })
      .then((res) => res.data);
  }

  /**
   * Remove a hit by its ID.
   * @param {string} hitId - Hit ID
   * @returns {Promise<Object>} Response data
   */
  remove(hitId) {
    return ax.delete(`/hit/${hitId}`).then((res) => res.data);
  }
}

export default new HitService();
