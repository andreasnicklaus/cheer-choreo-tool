import ax from "./RequestService";

class NotificationService {
  getAll() {
    return ax.get("/notifications").then((res) => res.data);
  }

  markAsNotRead(notificationId) {
    return ax
      .post(`/notifications/${notificationId}/unread`)
      .then((res) => res.data);
  }

  markAsRead(notificationId) {
    return ax
      .post(`/notifications/${notificationId}/read`)
      .then((res) => res.data);
  }

  delete(notificationId) {
    return ax
      .delete(`/notifications/${notificationId}`)
      .then((res) => res.data);
  }
}

export default new NotificationService();
