const { Sequelize, Op } = require("sequelize");
const Feedback = require("../db/models/feedback");
const MailService = require("./MailService");
const UserService = require("./UserService");

class FeedbackService {
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

  getAll(UserId) {
    return Feedback.findAll({ where: { UserId } });
  }

  getNewest() {
    return Feedback.findAll({ order: ["createdAt"] }).then((feedbackList) => {
      return feedbackList[0];
    });
  }

  getTotalAverage() {
    return Feedback.findAll({
      attributes: [[Sequelize.fn("avg", Sequelize.col("stars")), "rating"]],
    }).then((result) => parseFloat(result[0].dataValues.rating));
  }

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
