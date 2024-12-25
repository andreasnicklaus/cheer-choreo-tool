const nodemailer = require("nodemailer");
let ejs = require("ejs");
const { mailLogger } = require("./winston");

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

function verify() {
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
  )
    throw new Error("Not all needed environment variables are specified.");

  client.verify((error, success) => {
    if (error) {
      mailLogger.error(error);
      throw error;
    }
    if (success) mailLogger.info("Email server is ready to send messages.");
  });
}

async function sendMail(
  recipient,
  subject,
  templateName,
  variables = {},
  attachments = []
) {
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
    { ...variables, timestamp: new Date().toLocaleTimeString("de") },
    (err, html) => {
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
          .catch((err) => {
            mailLogger.error(err);
            throw err;
          });
      }
    }
  );
}

module.exports = { sendMail, verify };
