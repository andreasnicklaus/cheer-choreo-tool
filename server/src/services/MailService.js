const { mailAx } = require("./RequestService");

class MailService {
  sendUserRegistrationNotice(username, userId) {
    return mailAx.post("/newUser", { username, userId }).then((res) => {
      console.log(res.data);
    });
  }
}

module.exports = new MailService();
