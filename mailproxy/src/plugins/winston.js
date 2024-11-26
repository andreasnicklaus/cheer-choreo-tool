const winston = require("winston");

const logger = winston.createLogger({
  // Log only if level is less than (meaning more severe) or equal to this
  level: "info",
  // Use timestamp and printf to create a standard log format
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // Log to the console and a file
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "warning",
    }),
    new winston.transports.File({ filename: "./logs/mailproxy/info.log" }),
    new winston.transports.File({
      filename: "./logs/mailproxy/all.log",
      level: "debug",
    }),
  ],
});

const mailLogger = winston.createLogger({
  // Log only if level is less than (meaning more severe) or equal to this
  level: "debug",
  // Use timestamp and printf to create a standard log format
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // Log to the console and a file
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/mailproxy/mail.log",
      level: "debug",
    }),
  ],
});

module.exports = { logger, mailLogger };
module.exports.default = logger;
