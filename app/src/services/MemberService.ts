import { debug } from "@/utils/logging";
import ax from "./RequestService";
import type { Member } from "@/types";

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
  create(
    name: string,
    nickname: string,
    abbreviation: string,
    seasonTeamId: string
  ): Promise<Member> {
    debug("Creating new member", {
      name,
      nickname,
      abbreviation,
      seasonTeamId,
    });
    return ax
      .post("/member", { name, nickname, abbreviation, seasonTeamId })
      .then((res) => {
        debug("Successfully created member");
        return res.data;
      });
  }

  /**
   * Update a member's data.
   * @param {string} MemberId - ID of the member to update
   * @param {Object} data - Data to update the member with
   * @returns {Promise<Object>} Updated member
   */
  update(MemberId: string, data: Partial<Member>): Promise<Member> {
    debug("Updating member", { MemberId, data });
    return ax.put(`/member/${MemberId}`, data).then((res) => {
      debug("Successfully updated member");
      return res.data;
    });
  }

  /**
   * Remove a member by their ID.
   * @param {string} MemberId - ID of the member to remove
   * @returns {Promise<Object>} Response data
   */
  remove(MemberId: string): Promise<void> {
    debug("Deleting member", MemberId);
    return ax.delete(`/member/${MemberId}`).then((res) => {
      debug("Successfully removed member");
      return res.data;
    });
  }
}

export default new MemberService();
