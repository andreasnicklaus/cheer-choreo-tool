const { verify, sendMail } = require("../plugins/nodemailer");
const { timeStringToMillis } = require("../utils/time");
const i18n = require("i18n");

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
              path: "https://www.choreo-planer.de/Icon.png",
              cid: "choreo-planer-icon",
            },
          ],
          "de"
        );
      })
    );
  }

  sendWelcomeEmail(username, userId, userEmail, locale) {
    return sendMail(
      userEmail,
      i18n.__({ phrase: "mail.welcome.willkommen-beim-choreo-planer", locale }),
      "welcome.ejs",
      {
        username,
        userId,
        backendDomain: process.env.BACKEND_DOMAIN,
      },
      [
        {
          filename: "logo.png",
          path: "https://www.choreo-planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ],
      locale
    );
  }

  sendEmailConfirmationEmail(username, userId, userEmail, locale) {
    return sendMail(
      userEmail,
      i18n.__({
        phrase: "mail.confirmEmail.bitte-bestaetige-deine-e-mail-adresse",
        locale,
      }),
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
          path: "https://www.choreo-planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ],
      locale
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
              path: "https://www.choreo-planer.de/Icon.png",
              cid: "choreo-planer-icon",
            },
          ],
          "en"
        );
      })
    );
  }

  sendSsoEmail(userEmail, username, ssoToken, locale) {
    return sendMail(
      userEmail,
      i18n.__({ phrase: "mail.ssoLogin.dein-login-link", locale }),
      "ssoLogin.ejs",
      {
        username,
        ssoToken,
        frontendDomain: process.env.FRONTEND_DOMAIN,
        expirationDate: new Date(
          new Date().valueOf() +
            timeStringToMillis(process.env.SSO_TOKEN_EXPIRES_IN)
        ).toLocaleString(locale, {
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
          path: "https://www.choreo-planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ],
      locale
    );
  }

  sendNotificationNotice(
    userEmail,
    username,
    ssoToken,
    notificationTitle = null,
    locale
  ) {
    return sendMail(
      userEmail,
      i18n.__({ phrase: "mail.newNotification.neue-benachrichtigung", locale }),
      "newNotification.ejs",
      {
        username,
        ssoToken,
        notificationTitle,
        frontendDomain: process.env.FRONTEND_DOMAIN,
        expirationDate: new Date(
          new Date().valueOf() +
            timeStringToMillis(process.env.SSO_TOKEN_EXPIRES_IN)
        ).toLocaleString(locale, {
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
          path: "https://www.choreo-planer.de/Icon.png",
          cid: "choreo-planer-icon",
        },
      ],
      locale
    );
  }
}

module.exports = new MailService();
