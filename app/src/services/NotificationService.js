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
   * @param {string} notificationId
   * @returns {Promise<Object>} Response data
   */
  markAsNotRead(notificationId) {
    return ax
      .post(`/notifications/${notificationId}/unread`)
      .then((res) => res.data);
  }

  /**
   * Mark a notification as read.
   * @param {string} notificationId
   * @returns {Promise<Object>} Response data
   */
  markAsRead(notificationId) {
    return ax
      .post(`/notifications/${notificationId}/read`)
      .then((res) => res.data);
  }

  /**
   * Delete a notification by its ID.
   * @param {string} notificationId
   * @returns {Promise<Object>} Response data
   */
  delete(notificationId) {
    return ax
      .delete(`/notifications/${notificationId}`)
      .then((res) => res.data);
  }
}

export default new NotificationService();
