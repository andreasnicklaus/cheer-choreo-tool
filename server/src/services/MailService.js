const { verify, sendMail } = require("../plugins/nodemailer");
const { timeStringToMillis } = require("../utils/time");
const i18n = require("i18n");

/**
 * Service for sending emails and managing mail operations.
 * Handles email composition, sending, and related logic.
 *
 * @class MailService
 */
class MailService {
  constructor() {
    verify();
    this.adminEmails = process.env.EMAIL_ADMIN_ADDRESSES?.split(",") || [];
  }

  /**
   * Sends a notice to admin emails about a new user registration.
   * @param {string} username - The username of the new user.
   * @param {string} userId - The ID of the new user.
   * @param {string} userEmail - The email of the new user.
   * @returns {Promise<void[]>} Resolves when all emails are sent.
   */
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

  /**
   * Sends a welcome email to a new user.
   * @param {string} username - The username of the new user.
   * @param {string} userId - The ID of the new user.
   * @param {string} userEmail - The email of the new user.
   * @param {string} locale - The locale for the email content.
   * @returns {Promise<void>} Resolves when the email is sent.
   */
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

  /**
   * Sends an email confirmation request to a user.
   * @param {string} username - The username of the user.
   * @param {string} userId - The ID of the user.
   * @param {string} userEmail - The email of the user.
   * @param {string} locale - The locale for the email content.
   * @returns {Promise<void>} Resolves when the email is sent.
   */
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

  /**
   * Sends a feedback notice to admin emails.
   * @param {string} username - The username of the user providing feedback.
   * @param {string} userEmail - The email of the user providing feedback.
   * @param {number} stars - The rating provided by the user.
   * @param {string} text - The feedback text provided by the user.
   * @returns {Promise<void[]>} Resolves when all emails are sent.
   */
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

  /**
   * Sends an SSO login email to a user.
   * @param {string} userEmail - The email of the user.
   * @param {string} username - The username of the user.
   * @param {string} ssoToken - The SSO token for login.
   * @param {string} locale - The locale for the email content.
   * @returns {Promise<void>} Resolves when the email is sent.
   */
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

  /**
   * Sends a notification email to a user.
   * @param {string} userEmail - The email of the user.
   * @param {string} username - The username of the user.
   * @param {string} ssoToken - The SSO token for login.
   * @param {string|null} notificationTitle - The title of the notification.
   * @param {string} locale - The locale for the email content.
   * @returns {Promise<void>} Resolves when the email is sent.
   */
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
