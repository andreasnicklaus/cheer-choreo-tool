import { debug } from "@/utils/logging";
import ax from "./RequestService";

/**
 * Service for managing seasons.
 * @class SeasonService
 */
class SeasonService {
  /**
   * Get all seasons.
   * @returns {Promise<Array>} Array of season objects
   */
  getAll() {
    debug("Querying seasons");
    return ax.get("/season").then((res) => {
      debug("Successfully queried seasons");
      return res.data;
    });
  }

  /**
   * Create a new season.
   * @param {string} name - Name of the season
   * @param {number} year - Year of the season
   * @param {string|null} ownerId - ID of the owner
   * @returns {Promise<Object>} Created season
   */
  create(name, year, ownerId = null) {
    debug("Creating a new season", { name, year, ownerId });
    return ax.post("/season", { name, year, ownerId }).then((res) => {
      debug("Successfully created new season");
      return res.data;
    });
  }
}

export default new SeasonService();
