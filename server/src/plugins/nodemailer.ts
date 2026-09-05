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

let smtpVerified = false;

if (process.env.SMTP_SERVER && process.env.SMTP_PORT && process.env.SMTP_USER) {
  client.verify((error: Error, success: boolean) => {
    if (!error && success) {
      smtpVerified = true;
    }
  });
}

export function isMailConfigured(): boolean {
  return !!(
    process.env.SMTP_SERVER &&
    process.env.SMTP_PORT &&
    process.env.SMTP_FROM_ADDRESS &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.EMAIL_ADMIN_ADDRESSES &&
    process.env.BACKEND_DOMAIN
  );
}

export function isMailHealthy(): boolean {
  return smtpVerified;
}

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
    mailLogger.warn(
      "Mail not configured — SMTP env vars missing. Skipping verification.",
    );
    return;
  }

  client.verify((error: Error, success: boolean) => {
    if (error) {
      mailLogger.error("SMTP verification failed:", error);
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
  locale = "en",
) {
  variables = { ...variables, t: i18n.__, locale };

  mailLogger.info(
    `Sending mail with ${JSON.stringify({
      recipient,
      subject,
      templateName,
      variables,
      attachments,
    })}`,
  );

  const html = await new Promise<string>((resolve, reject) => {
    ejs.renderFile(
      "src/views/mail/" + templateName,
      { ...variables, timestamp: new Date().toLocaleTimeString(locale) },
      (err: Error, html: string) => {
        if (err) reject(err);
        else resolve(html);
      },
    );
  });

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
      mailLogger.error("Failed to send mail:", err);
    });
}

export default { sendMail, verify };
