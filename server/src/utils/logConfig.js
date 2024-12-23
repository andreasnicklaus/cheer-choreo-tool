const { logger } = require("../plugins/winston");

function logConfig() {
  const dbName = process.env.POSTGRES_DB || "not defined";
  const dbUsername = process.env.POSTGRES_USER || "not defined";
  const dbHost = process.env.DB_HOST || "not defined";
  const dbPassword = process.env.POSTGRES_PASSWORD
    ? "<redacted>"
    : "not defined";

  const tokenSecret = process.env.TOKEN_SECRET ? "<redacted>" : "not defined";
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "not defined";

  const mailProxyHost = process.env.MAILPROXY_HOST || "not defined";
  const mailProxyPort = process.env.MAILPROXY_PORT || "not defined";
  const mailProxySecret = process.env.MAILPROXY_SECRET
    ? "<redacted>"
    : "not defined";

  const frontendDomain = process.env.FRONTEND_DOMAIN || "not defined";

  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || "not defined";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD
    ? "<redacted>"
    : "not defined";

  logger.info("################");
  logger.info("Configuration:");
  logger.info("################");
  logger.info(`  Database name:      ${dbName}`);
  logger.info(`  Database username:  ${dbUsername}`);
  logger.info(`  Database host:      ${dbHost}`);
  logger.info(`  Database password:  ${dbPassword}`);
  logger.info();
  logger.info(`  JWT token secret:   ${tokenSecret}`);
  logger.info(`  JWT expires in:     ${jwtExpiresIn}`);
  logger.info();
  logger.info(`  Default admin:      ${adminUsername}`);
  logger.info(`  Default admin pass: ${adminPassword}`);
  logger.info();
  logger.info(`  Mailproxy host:     ${mailProxyHost}`);
  logger.info(`  Mailproxy port:     ${mailProxyPort}`);
  logger.info(`  Mailproxy secret:   ${mailProxySecret}`);
  logger.info();
  logger.info(`  Frontend Domain:    ${frontendDomain}`);
  logger.info("################");
}

module.exports = logConfig;
