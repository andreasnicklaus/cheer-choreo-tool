import ax from "./RequestService";

/**
 * Service for managing members in a team or season.
 * @class MemberService
 */
class MemberService {
  /**
   * Create a new member.
   * @param {string} name
   * @param {string} nickname
   * @param {string} abbreviation
   * @param {string} seasonTeamId
   * @returns {Promise<Object>} Created member
   */
  create(name, nickname, abbreviation, seasonTeamId) {
    return ax
      .post("/member", { name, nickname, abbreviation, seasonTeamId })
      .then((res) => res.data);
  }

  /**
   * Update a member's data.
   * @param {string} memberId
   * @param {Object} data
   * @returns {Promise<Object>} Updated member
   */
  update(memberId, data) {
    return ax.put(`/member/${memberId}`, data).then((res) => res.data);
  }

  /**
   * Remove a member by their ID.
   * @param {string} memberId
   * @returns {Promise<Object>} Response data
   */
  remove(memberId) {
    return ax.delete(`/member/${memberId}`).then((res) => res.data);
  }
}

export default new MemberService();
