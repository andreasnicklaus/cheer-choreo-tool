import ax from "./RequestService";

/**
 * Service for sending and retrieving user feedback.
 *
 * @class FeedbackService
 */
class FeedbackService {
  /**
   * Send user feedback with a star rating and text.
   * @param {number} stars - Number of stars (rating)
   * @param {string} text - Feedback text
   * @returns {Promise<Object>} Response data
   */
  sendFeedback(stars, text) {
    return ax.post("/feedback", { stars, text }).then((res) => res.data);
  }

  /**
   * Get all feedback entries.
   * @returns {Promise<Array>} Array of feedback objects
   */
  getAll() {
    return ax.get("/feedback").then((res) => res.data);
  }
}

export default new FeedbackService();
