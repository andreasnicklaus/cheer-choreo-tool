import { debug } from "@/utils/logging";
import ax from "./RequestService";

/**
 * Service for managing user notifications.
 * @class NotificationService
 */
class NotificationService {
  /**
   * Get all notifications for the user.
   * @returns {Promise<Array>} Array of notification objects
   */
  getAll() {
    return ax.get("/notifications").then((res) => res.data);
  }

  /**
   * Mark a notification as not read.
   * @param {string} notificationId - ID of the notification to mark as not read
   * @returns {Promise<Object>} Response data
   */
  markAsNotRead(notificationId) {
    debug("Marking notification as not read", notificationId);
    return ax.post(`/notifications/${notificationId}/unread`).then((res) => {
      debug("Successfully marked notification as not read");
      return res.data;
    });
  }

  /**
   * Mark a notification as read.
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise<Object>} Response data
   */
  markAsRead(notificationId) {
    debug("Marking notification as read", notificationId);
    return ax.post(`/notifications/${notificationId}/read`).then((res) => {
      debug("Successfully marked notification as read");
      return res.data;
    });
  }

  /**
   * Delete a notification by its ID.
   * @param {string} notificationId - ID of the notification to delete
   * @returns {Promise<Object>} Response data
   */
  delete(notificationId) {
    debug("Deleting notification", notificationId);
    return ax.delete(`/notifications/${notificationId}`).then((res) => {
      debug("Successfully removed notification");
      return res.data;
    });
  }
}

export default new NotificationService();
