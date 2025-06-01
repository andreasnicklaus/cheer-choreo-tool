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
    return ax.get("/season").then((res) => res.data);
  }

  /**
   * Create a new season.
   * @param {string} name - Name of the season
   * @param {number} year - Year of the season
   * @returns {Promise<Object>} Created season
   */
  create(name, year) {
    return ax.post("/season", { name, year }).then((res) => res.data);
  }
}

export default new SeasonService();
