import { debug } from "@/utils/logging";
import ax from "./RequestService";
import type { Hit } from "@/types";

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
   * @param {Array} MemberIds - Array of member IDs
   * @returns {Promise<Object>} Created hit
   */
  create(
    name: string,
    count: number,
    choreoId: string,
    MemberIds: string[] = []
  ): Promise<Hit> {
    debug("Creating a new hit", { name, count, choreoId, MemberIds });
    return ax.post("/hit", { name, count, choreoId, MemberIds }).then((res) => {
      debug("Successfully created new hit");
      return res.data;
    });
  }

  /**
   * Set the count for a hit.
   * @param {string} hitId - Hit ID
   * @param {number} count - New count
   * @returns {Promise<Object>} Updated hit
   */
  setCount(hitId: string, count: number): Promise<Hit> {
    debug("Setting count of hit", { hitId, count });
    return ax.put(`/hit/${hitId}`, { count }).then((res) => {
      debug("Successfully set count");
      return res.data;
    });
  }

  /**
   * Update a hit's details.
   * @param {string} hitId - Hit ID
   * @param {string} name - Name of the hit
   * @param {number} count - Count for the hit
   * @param {Array} MemberIds - Array of member IDs
   * @returns {Promise<Object>} Updated hit
   */
  update(
    hitId: string,
    name: string,
    count: number,
    MemberIds: string[]
  ): Promise<Hit> {
    debug("Updating hit", { hitId, name, count, MemberIds });
    return ax
      .put(`/hit/${hitId}`, {
        name,
        count,
        MemberIds,
      })
      .then((res) => {
        debug("Successfully updated hit");
        return res.data;
      });
  }

  /**
   * Remove a hit by its ID.
   * @param {string} hitId - Hit ID
   * @returns {Promise<Object>} Response data
   */
  remove(hitId: string): Promise<void> {
    debug("Deleting hit", hitId);
    return ax.delete(`/hit/${hitId}`).then((res) => {
      debug("Successfully deleted hit");
      return res.data;
    });
  }
}

export default new HitService();
