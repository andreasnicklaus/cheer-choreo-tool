import { debug } from "@/utils/logging";
import ax from "./RequestService";

/**
 * Service for managing user access relationships.
 * @class UserAccessService
 */
class UserAccessService {
  /**
   * Get all owners that have shared access with the current user.
   * @returns {Promise<Array>} List of user access relationships
   */
  getOwners() {
    debug("Getting owners");
    return ax.get("/user/access/owner").then((res) => {
      debug("Successfully got owners");
      return res.data;
    });
  }

  /**
   * Get all users that the current user has access to (children).
   * @returns {Promise<Array>} List of user access relationships
   */
  getChildren() {
    debug("Getting children");
    return ax.get("/user/access").then((res) => {
      debug("Successfully got children");
      return res.data;
    });
  }

  /**
   * Invite a user by email to share access.
   * @param {string} childEmail - Email of the user to invite
   * @param {string} role - Role (coach/assistant/athlete)
   * @returns {Promise<Object>} Created access
   */
  invite(childEmail, role) {
    debug("Inviting user", { childEmail, role });
    return ax.post("/user/access", { childEmail, role }).then((res) => {
      debug("Successfully sent invitation");
      return res.data;
    });
  }

  /**
   * Update a user access relationship.
   * @param {string} id - ID of the access to update
   * @param {Object} data - Data to update (role, enabled)
   * @returns {Promise<Object>} Updated access
   */
  update(id, data) {
    debug("Updating access", { id, data });
    return ax.put(`/user/access/${id}`, data).then((res) => {
      debug("Successfully updated access");
      return res.data;
    });
  }

  /**
   * Remove a user access relationship.
   * @param {string} id - ID of the access to remove
   * @returns {Promise<void>} Response
   */
  remove(id) {
    debug("Removing access", { id });
    return ax.delete(`/user/access/${id}`).then((res) => {
      debug("Successfully removed access");
      return res.data;
    });
  }

  /**
   * Accept an access invitation.
   * @param {string} id - ID of the access to accept
   * @returns {Promise<Object>} Updated access
   */
  accept(id) {
    debug("Accepting access", { id });
    return ax.post(`/user/access/${id}/accept`).then((res) => {
      debug("Successfully accepted access");
      return res.data;
    });
  }

  /**
   * Decline an access invitation.
   * @param {string} id - ID of the access to decline
   * @returns {Promise<void>} Response
   */
  decline(id) {
    debug("Declining access", { id });
    return ax.post(`/user/access/${id}/decline`).then((res) => {
      debug("Successfully declined access");
      return res.data;
    });
  }
}

export default new UserAccessService();
