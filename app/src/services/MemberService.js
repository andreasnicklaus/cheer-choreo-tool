import ax from "./RequestService";

/**
 * Service for managing members in a team or season.
 * @class MemberService
 */
class MemberService {
  /**
   * Create a new member.
   * @param {string} name - Full name of the member
   * @param {string} nickname - Nickname of the member
   * @param {string} abbreviation - Abbreviation for the member
   * @param {string} seasonTeamId - ID of the season team the member belongs to
   * @returns {Promise<Object>} Created member
   */
  create(name, nickname, abbreviation, seasonTeamId) {
    return ax
      .post("/member", { name, nickname, abbreviation, seasonTeamId })
      .then((res) => res.data);
  }

  /**
   * Update a member's data.
   * @param {string} memberId - ID of the member to update
   * @param {Object} data - Data to update the member with
   * @returns {Promise<Object>} Updated member
   */
  update(memberId, data) {
    return ax.put(`/member/${memberId}`, data).then((res) => res.data);
  }

  /**
   * Remove a member by their ID.
   * @param {string} memberId - ID of the member to remove
   * @returns {Promise<Object>} Response data
   */
  remove(memberId) {
    return ax.delete(`/member/${memberId}`).then((res) => res.data);
  }
}

export default new MemberService();
