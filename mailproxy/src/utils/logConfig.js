const { logger } = require("../plugins/winston");

function logConfig() {
  const smtpServer = process.env.SMTP_SERVER || "not defined";
  const smtpDomain = process.env.SMTP_DOMAIN || "not defined";
  const smtpUser = process.env.SMTP_USER || "not defined";
  const smtpPort = process.env.SMTP_PORT || "not defined";
  const smtpPassword = process.env.SMTP_PASSWORD ? "<redacted>" : "not defined";

  const emailAdminAddresses =
    process.env.EMAIL_ADMIN_ADDRESSES || "not defined";

  const mailProxySecret = process.env.MAILPROXY_SECRET
    ? "<redacted>"
    : "not defined";

  const backendDomain = process.env.BACKEND_DOMAIN || "not defined";

  logger.info("################");
  logger.info("Configuration:");
  logger.info("################");
  logger.info(`  SMTP server:            ${smtpServer}`);
  logger.info(`  SMTP domain:            ${smtpDomain}`);
  logger.info(`  SMTP user:              ${smtpUser}`);
  logger.info(`  SMTP port:              ${smtpPort}`);
  logger.info(`  SMTP password:          ${smtpPassword}`);
  logger.info();
  logger.info(`  Email admin addresses:  ${emailAdminAddresses}`);
  logger.info();
  logger.info(`  Mailproxy secret:       ${mailProxySecret}`);
  logger.info();
  logger.info(`  Backend Domain:         ${backendDomain}`);
  logger.info("################");
}

module.exports = logConfig;
