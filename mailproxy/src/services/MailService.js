const { verify, sendMail } = require("../plugins/nodemailer");

class MailService {
  constructor() {
    verify();
  }

  sendUserRegistrationNotice(username, userId, userEmail) {
    return Promise.all(
      process.env.EMAIL_ADMIN_ADDRESSES.split(",").map((recipient) => {
        return sendMail(recipient, "Neuer Nutzer", "newUser.ejs", {
          username,
          userId,
          userEmail,
        });
      })
    );
  }
  sendWelcomeEmail(username, userId, userEmail) {
    return sendMail(userEmail, "Willkommen beim Choreo Planer", "welcome.ejs", {
      username,
      userId,
      backendDomain: process.env.BACKEND_DOMAIN,
    });
  }
  sendEmailConfirmationEmail(username, userId, userEmail) {
    return sendMail(
      userEmail,
      "Bitte bestätige deine E-Mail-Adresse",
      "confirmEmail.ejs",
      {
        username,
        userId,
        userEmail,
        backendDomain: process.env.BACKEND_DOMAIN,
      }
    );
  }

  sendFeedbackNotice(username, userEmail, stars, text) {
    return Promise.all(
      process.env.EMAIL_ADMIN_ADDRESSES.split(",").map((recipient) => {
        return sendMail(
          recipient,
          "Feedback ist eingegangen",
          "newFeedback.ejs",
          {
            username,
            userEmail,
            stars,
            text,
          }
        );
      })
    );
  }
}

module.exports = new MailService();
