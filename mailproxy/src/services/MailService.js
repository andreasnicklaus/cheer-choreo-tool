const { verify, sendMail } = require("../plugins/nodemailer");

class MailService {
  constructor() {
    verify();
  }

  sendUserRegistrationNotice(username, userId) {
    return Promise.all(
      process.env.EMAIL_ADMIN_ADDRESSES.split(",").map((recipient) => {
        return sendMail(recipient, "Neuer Nutzer", "newUser.ejs", {
          username,
          userId,
        });
      })
    );
  }
}

module.exports = new MailService();
