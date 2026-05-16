import logger from "../plugins/winston";

function logConfig() {
  logger.debug("Starting logging the configuration variables");

  const nodeEnv = process.env.NODE_ENV || "not defined";

  const dbName = process.env.POSTGRES_DB || "not defined";
  const dbUsername = process.env.POSTGRES_USER || "not defined";
  const dbHost = process.env.DB_HOST || "not defined";
  const dbPassword = process.env.POSTGRES_PASSWORD
    ? "<redacted>"
    : "not defined"; // njsscan-ignore: node_password

  const tokenSecret = process.env.TOKEN_SECRET ? "<redacted>" : "not defined"; // njsscan-ignore: node_secret
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "not defined";
  const ssoTokenExpiresIn = process.env.SSO_TOKEN_EXPIRES_IN || "not defined";

  const frontendDomain = process.env.FRONTEND_DOMAIN || "not defined";

  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || "not defined";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD
    ? "<redacted>"
    : "not defined"; // njsscan-ignore: node_password

  const smtpServer = process.env.SMTP_SERVER || "not defined";
  const smtpUser = process.env.SMTP_USER || "not defined";
  const smtpPort = process.env.SMTP_PORT || "not defined";
  const smtpPassword = process.env.SMTP_PASSWORD ? "<redacted>" : "not defined"; // njsscan-ignore: node_password

  const emailAdminAddresses =
    process.env.EMAIL_ADMIN_ADDRESSES || "not defined";

  const backendDomain = process.env.BACKEND_DOMAIN || "not defined";

  const LogIngestingHost =
    process.env.BETTERSTACK_LOG_INGESTING_HOST || "not defined";
  const LogSourceToken = process.env.BETTERSTACK_LOG_SOURCE_TOKEN
    ? "<redacted>"
    : "not defined"; // njsscan-ignore: node_password

  const FeatureFlagApiKey = process.env.UNLEASH_API_KEY
    ? "<redacted>"
    : "not defined";

  logger.info("################");
  logger.info("Configuration:");
  logger.info("################");
  logger.info(`  Node Environment:      ${nodeEnv}`);
  logger.info("");
  logger.info(`  Database name:         ${dbName}`);
  logger.info(`  Database username:     ${dbUsername}`);
  logger.info(`  Database host:         ${dbHost}`);
  logger.info(`  Database password:     ${dbPassword}`);
  logger.info("");
  logger.info(`  JWT token secret:      ${tokenSecret}`);
  logger.info(`  JWT expires in:        ${jwtExpiresIn}`);
  logger.info(`  SSO token expires in:  ${ssoTokenExpiresIn}`);
  logger.info("");
  logger.info(`  Default admin:         ${adminUsername}`);
  logger.info(`  Default admin pass:    ${adminPassword}`);
  logger.info("");
  logger.info(`  SMTP Server:           ${smtpServer}`);
  logger.info(`  SMTP User:             ${smtpUser}`);
  logger.info(`  SMTP Port:             ${smtpPort}`);
  logger.info(`  SMTP Password:         ${smtpPassword}`);
  logger.info("");
  logger.info(`  Admin emails:          ${emailAdminAddresses}`);
  logger.info("");
  logger.info(`  Frontend Domain:       ${frontendDomain}`);
  logger.info(`  Backend Domain:        ${backendDomain}`);
  logger.info("");
  logger.info(`  Log Source Token:      ${LogSourceToken}`);
  logger.info(`  Log Ingesting Host:    ${LogIngestingHost}`);
  logger.info("");
  logger.info(`  Feature Flag API Key:  ${FeatureFlagApiKey}`);
  logger.info("################");
}

export default logConfig;
