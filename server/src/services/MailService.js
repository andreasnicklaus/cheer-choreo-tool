const { mailAx } = require("./RequestService");

class MailService {
  sendUserRegistrationNotice(username, userId, userEmail) {
    return mailAx
      .post("/newUser", { username, userId, userEmail })
      .then((res) => {
        console.log(res.data);
      });
  }

  sendFeedbackNotice(username, userEmail, stars, text) {
    return mailAx
      .post("/newFeedback", { username, userEmail, stars, text })
      .then((res) => console.log(res.data));
  }
}

module.exports = new MailService();
