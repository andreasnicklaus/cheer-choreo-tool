const nodemailer = require("nodemailer");
let ejs = require("ejs");
const { mailLogger } = require("./winston");

const client = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  name: process.env.SMTP_DOMAIN,
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
      process.env.SMTP_DOMAIN &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.EMAIL_ADMIN_ADDRESSES &&
      process.env.MAILPROXY_SECRET
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

async function sendMail(recipient, subject, templateName, variables = {}) {
  mailLogger.info(
    `Sending mail with ${JSON.stringify({
      recipient,
      subject,
      templateName,
      variables,
    })}`
  );
  ejs.renderFile(
    "src/views/" + templateName,
    { ...variables, timestamp: new Date().toLocaleTimeString("de") },
    (err, html) => {
      if (err) mailLogger.error(err);
      else {
        return client
          .sendMail({
            from: process.env.SMTP_USER,
            to: recipient,
            subject,
            html,
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
