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
}

module.exports = new FeedbackService();
