const { verify, sendMail } = require("../plugins/nodemailer");
const { timeStringToMillis } = require("../utils/time");

class MailService {
  constructor() {
    verify();
    this.adminEmails = process.env.EMAIL_ADMIN_ADDRESSES?.split(",") || [];
  }

  sendUserRegistrationNotice(username, userId, userEmail) {
    return Promise.all(
      this.adminEmails.map((recipient) => {
        return sendMail(
          recipient,
          "Neuer Nutzer",
          "newUser.ejs",
          {
            username,
            userId,
            userEmail,
          },
          [
            {
              filename: "logo.png",
              path: "https://www.choreo-Planer.de/Icon.png",
              cid: "choreo-planer-icon",
            },
          ]
        );
      })
    );
  }

  sendWelcomeEmail(username, userId, userEmail) {
    return sendMail(
      userEmail,
      "Willkommen beim Choreo Planer",
      "welcome.ejs",
      {
        username,
        userId,
        backendDomain: process.env.BACKEND_DOMAIN,
      },
      [
        {
          filename: "logo.png",
          path: "https://www.choreo-Planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ]
    );
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
      },
      [
        {
          filename: "logo.png",
          path: "https://www.choreo-Planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ]
    );
  }

  sendFeedbackNotice(username, userEmail, stars, text) {
    return Promise.all(
      this.adminEmails.map((recipient) => {
        return sendMail(
          recipient,
          "Feedback ist eingegangen",
          "newFeedback.ejs",
          {
            username,
            userEmail,
            stars,
            text,
          },
          [
            {
              filename: "logo.png",
              path: "https://www.choreo-Planer.de/Icon.png",
              cid: "choreo-planer-icon",
            },
          ]
        );
      })
    );
  }

  sendSsoEmail(userEmail, username, ssoToken) {
    return sendMail(
      userEmail,
      "Dein Login-Link",
      "ssoLogin.ejs",
      {
        username,
        ssoToken,
        frontendDomain: process.env.FRONTEND_DOMAIN,
        expirationDate: new Date(
          new Date() + timeStringToMillis(process.env.SSO_TOKEN_EXPIRES_IN)
        ).toLocaleString("de", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
      },
      [
        {
          filename: "logo.png",
          path: "https://www.choreo-Planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ]
    );
  }

  sendNotificationNotice(
    userEmail,
    username,
    ssoToken,
    notificationTitle = null
  ) {
    return sendMail(
      userEmail,
      "Neue Benachrichtigung!",
      "newNotification.ejs",
      {
        username,
        ssoToken,
        notificationTitle,
        frontendDomain: process.env.FRONTEND_DOMAIN,
        expirationDate: new Date(
          new Date() + timeStringToMillis(process.env.SSO_TOKEN_EXPIRES_IN)
        ).toLocaleString("de", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
      },
      [
        {
          filename: "logo.png",
          path: "https://www.choreo-Planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ]
    );
  }
}

module.exports = new MailService();
