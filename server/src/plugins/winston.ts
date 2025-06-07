import winston from "winston";
import { Logtail } from "@logtail/node"
import { LogtailTransport } from "@logtail/winston"

const $SOURCE_TOKEN = process.env.BETTERSTACK_LOG_SOURCE_TOKEN as string
const $INGESTING_HOST = process.env.BETTERSTACK_LOG_INGESTING_HOST

const betterStackLogTail = new Logtail($SOURCE_TOKEN, {
  endpoint: `https://${$INGESTING_HOST}`,
})

const logger = winston.createLogger({
  // Log only if level is less than (meaning more severe) or equal to this
  level: "info",
  // Use timestamp and printf to create a standard log format
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info: Record<string, string>) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // Log to the console and a file
  transports: [
    new LogtailTransport(betterStackLogTail),
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "warn",
    }),
    new winston.transports.File({ filename: "./logs/info.log" }),
    new winston.transports.File({
      filename: "./logs/all.log",
      level: "debug",
    }),
  ],
});

const dbLogger = winston.createLogger({
  // Log only if level is less than (meaning more severe) or equal to this
  level: "debug",
  // Use timestamp and printf to create a standard log format
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info: Record<string, string>) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // Log to the console and a file
  transports: [
    new winston.transports.File({ filename: "./logs/db.log", level: "debug" }),
  ],
});

const mailLogger = winston.createLogger({
  // Log only if level is less than (meaning more severe) or equal to this
  level: "debug",
  // Use timestamp and printf to create a standard log format
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info: Record<string, string>) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // Log to the console and a file
  transports: [
    new LogtailTransport(betterStackLogTail),
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/mail.log",
      level: "debug",
    }),
  ],
});

export { logger, dbLogger, mailLogger };
export default logger;
