const { Sequelize, Op } = require("sequelize");
const Feedback = require("../db/models/feedback");
const MailService = require("./MailService");
const UserService = require("./UserService");

/**
 * Service for handling user feedback.
 * Manages feedback submission, retrieval, and processing.
 *
 * @class FeedbackService
 */
class FeedbackService {
  /**
   * Create a new Feedback
   *
   * @param {number} stars - Number of stars given in the feedback.
   * @param {string} text - Text content of the feedback.
   * @param {UUID} UserId - ID of the user submitting the feedback.
   * @returns {Promise<Feedback>} The created feedback object.
   */
  create(stars, text, UserId) {
    return Feedback.create({ stars, text, UserId }).then(async (feedback) => {
      let user = null;
      if (UserId) user = await UserService.findById(UserId).catch(() => null);
      MailService.sendFeedbackNotice(
        user?.username,
        user?.email,
        feedback.stars,
        feedback.text
      );
      return feedback;
    });
  }

  /**
   * Get all Feedbacks
   *
   * @param {UUID} UserId - ID of the user whose feedbacks are to be retrieved.
   * @returns {Promise<Feedback[]>} List of feedbacks for the user.
   */
  getAll(UserId) {
    return Feedback.findAll({ where: { UserId } });
  }

  /**
   * Get newest Feedback
   *
   * @returns {Promise<Feedback>} The most recently created feedback.
   */
  getNewest() {
    return Feedback.findAll({ order: ["createdAt"] }).then((feedbackList) => {
      return feedbackList[0];
    });
  }

  /**
   * Get the average stars of all Feedbacks
   *
   * @returns {Promise<number>} The average rating of all feedbacks.
   */
  getTotalAverage() {
    return Feedback.findAll({
      attributes: [[Sequelize.fn("avg", Sequelize.col("stars")), "rating"]],
    }).then((result) => parseFloat(result[0].dataValues.rating));
  }

  /**
   * Get the average stars of all Feedbacks in the last month
   *
   * @returns {Promise<number>} The average rating of feedbacks from the last month.
   */
  getAverageOfLastMonth() {
    return Feedback.findAll({
      where: {
        createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
      },
      attributes: [[Sequelize.fn("avg", Sequelize.col("stars")), "rating"]],
    }).then((result) => parseFloat(result[0].dataValues.rating));
  }
}

module.exports = new FeedbackService();
