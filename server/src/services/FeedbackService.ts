import Feedback from "../db/models/feedback";
import logger from "../plugins/winston";
import MailService from "./MailService";
import UserService from "./UserService";

const { Sequelize, Op } = require("sequelize");

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
  create(stars: number, text: string, UserId: string) {
    logger.debug(
      `FeedbackService create ${JSON.stringify({ stars, text, UserId })}`,
    );
    return Feedback.create({ stars, text, UserId }).then(async (feedback) => {
      let user = null;
      if (UserId) user = await UserService.findById(UserId).catch(() => null);
      if (!user)
        throw new Error("User does not exist in order to create this feedback");
      if (user.email)
        MailService.sendFeedbackNotice(
          user?.username,
          user?.email,
          feedback.stars,
          feedback.text,
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
  getAll(UserId: string) {
    logger.debug(`FeedbackService getAll ${JSON.stringify({ UserId })}`);
    return Feedback.findAll({ where: { UserId } });
  }

  /**
   * Get newest Feedback
   *
   * @returns {Promise<Feedback>} The most recently created feedback.
   */
  getNewest() {
    logger.debug(`FeedbackService getNewest`);
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
    logger.debug(`FeedbackService getTotalAverage`);
    return Feedback.findAll({
      attributes: [[Sequelize.fn("avg", Sequelize.col("stars")), "stars"]],
    }).then((result) => parseFloat(String(result[0].dataValues.stars)));
  }

  /**
   * Get the average stars of all Feedbacks in the last month
   *
   * @returns {Promise<number>} The average rating of feedbacks from the last month.
   */
  getAverageOfLastMonth() {
    logger.debug(`FeedbackService getAverageOfLastMonth`);
    return Feedback.findAll({
      where: {
        createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
      },
      attributes: [[Sequelize.fn("avg", Sequelize.col("stars")), "stars"]],
    }).then((result) => parseFloat(String(result[0].dataValues.stars)));
  }
}

export default new FeedbackService();
