import ax from "./RequestService";

/**
 * Service for managing clubs and their data.
 * @class ClubService
 */
class ClubService {
  /**
   * Get all clubs.
   * @returns {Promise<Array>} Array of club objects
   */
  getAll() {
    return ax.get("/club").then((res) => res.data);
  }

  /**
   * Get a club by its ID.
   * @param {string} clubId - ID of the club
   * @returns {Promise<Object>} Club object
   */
  getById(clubId) {
    return ax.get(`/club/${clubId}`).then((res) => res.data);
  }

  /**
   * Find clubs by name.
   * @param {string} name - Name of the club to search for
   * @returns {Promise<Array>} Array of club objects
   */
  findByName(name) {
    return ax.get("/club", { params: { name } }).then((res) => res.data);
  }

  /**
   * Create a new club.
   * @param {string} name - Name of the club to create
   * @returns {Promise<Object>} Created club
   */
  create(name) {
    return ax.post("/club", { name }).then((res) => res.data);
  }

  /**
   * Update a club's data.
   * @param {string} clubId - ID of the club to update
   * @param {Object} data - Data to update the club with
   * @returns {Promise<Object>} Updated club
   */
  update(clubId, data) {
    return ax.put(`/club/${clubId}`, data).then((res) => res.data);
  }

  /**
   * Update a club's logo.
   * @param {string} clubId - ID of the club to update
   * @param {File} clubLogo - Logo file to upload
   * @returns {Promise<Object>} Response data
   */
  updateClubLogo(clubId, clubLogo) {
    const formData = new FormData();
    formData.append("clubLogo", clubLogo);
    return ax
      .put(`/club/${clubId}/clubLogo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }

  /**
   * Get a club's logo as a blob.
   * @param {string} clubId - ID of the club
   * @returns {Promise<Blob>} Club logo blob
   */
  getClubLogo(clubId) {
    const clubLogoUrl = `/club/${clubId}/clubLogo`;
    return ax.get(clubLogoUrl, { responseType: "blob" });
  }

  /**
   * Delete a club's logo.
   * @param {string} clubId - ID of the club
   * @returns {Promise<Object>} Response data
   */
  deleteClubLogo(clubId) {
    return ax.delete(`/club/${clubId}/clubLogo`).then((res) => res.data);
  }

  /**
   * Remove a club by its ID.
   * @param {string} clubId - ID of the club to remove
   * @returns {Promise<Object>} Response data
   */
  remove(clubId) {
    return ax.delete(`/club/${clubId}`).then((res) => res.data);
  }
}

export default new ClubService();
