const winston = require("winston");
const fs = require("fs/promises");

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
    new winston.transports.File({ filename: "./logs/info.log" }),
  ],
});

const dbLogger = winston.createLogger({
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
    new winston.transports.File({ filename: "./logs/db.log", level: "debug" }),
  ],
});

module.exports = { logger, dbLogger };
module.exports.default = logger;
