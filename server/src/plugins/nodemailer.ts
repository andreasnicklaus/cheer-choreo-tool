const nodemailer = require("nodemailer");
const ejs = require("ejs");
const { mailLogger } = require("./winston");
const i18n = require("i18n");

const client = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export function verify() {
  if (
    !(
      process.env.SMTP_SERVER &&
      process.env.SMTP_PORT &&
      process.env.SMTP_FROM_ADDRESS &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.EMAIL_ADMIN_ADDRESSES &&
      process.env.BACKEND_DOMAIN
    )
  ) {
    mailLogger.error("Not all needed environment variables are specified.")
    throw new Error("Not all needed environment variables are specified.");
  }

  client.verify((error: Error, success: boolean) => {
    if (error) {
      mailLogger.error(error);
      throw error;
    }
    if (success) mailLogger.info("Email server is ready to send messages.");
  });
}

export async function sendMail(
  recipient: string,
  subject: string,
  templateName: string,
  variables = {},
  attachments: object[] = [],
  locale = "en"
) {
  variables = { ...variables, t: i18n.__, locale };

  mailLogger.info(
    `Sending mail with ${JSON.stringify({
      recipient,
      subject,
      templateName,
      variables,
      attachments,
    })}`
  );

  ejs.renderFile(
    "src/views/mail/" + templateName,
    { ...variables, timestamp: new Date().toLocaleTimeString(locale) },
    (err: Error, html: string) => {
      if (err) mailLogger.error(err);
      else {
        return client
          .sendMail({
            from: {
              name: "Choreo Planer",
              address: process.env.SMTP_FROM_ADDRESS,
            },
            to: recipient,
            subject,
            html,
            attachments,
          })
          .catch((err: Error) => {
            mailLogger.error(err);
            throw err;
          });
      }
    }
  );
}

export default { sendMail, verify };
