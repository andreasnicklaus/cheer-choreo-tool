const { Sequelize } = require("sequelize");
const { dbLogger } = require("../plugins/winston");
require("dotenv").config();

const dbName = process.env.POSTGRES_DB;
const dbUsername = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || 5432;

const db = new Sequelize(dbName, dbUsername, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: dbLogger.debug.bind(dbLogger),
});

export default db