const { Sequelize } = require("sequelize");
const { dbLogger } = require("../plugins/winston");
require("dotenv").config();

const dbName = process.env.POSTGRES_DB;
const dbUsername = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.DB_HOST;

const db = new Sequelize(dbName, dbUsername, dbPassword, {
  host: dbHost,
  dialect: "postgres",
  logging: dbLogger.debug.bind(dbLogger),
});

module.exports = db;

const Club = require("./models/club");
const Member = require("./models/member");
const Team = require("./models/team");
const Choreo = require("./models/choreo");
const Lineup = require("./models/lineup");
const Hit = require("./models/hit");
const Position = require("./models/position");
const User = require("./models/user");
const seed = require("./seed");

Team.hasMany(Member);
Member.belongsTo(Team);

Club.hasMany(Team);
Team.belongsTo(Club);

Team.hasMany(Choreo);
Choreo.belongsTo(Team);

// TODO: Exclude Members from Choreo

Choreo.hasMany(Lineup);
Lineup.belongsTo(Choreo);

Choreo.hasMany(Hit);
Hit.belongsTo(Choreo);

Hit.belongsToMany(Member, { through: "HitMemberships" });
Member.belongsToMany(Hit, { through: "HitMemberships" });

Lineup.hasMany(Position);
Position.belongsTo(Lineup);

Member.hasMany(Position);
Position.belongsTo(Member);

User.hasMany(Club);
Club.belongsTo(User);

User.hasMany(Team);
Team.belongsTo(User);

User.hasMany(Member);
Member.belongsTo(User);

User.hasMany(Choreo);
Choreo.belongsTo(User);

User.hasMany(Lineup);
Lineup.belongsTo(User);

User.hasMany(Position);
Position.belongsTo(User);

User.hasMany(Hit);
Hit.belongsTo(User);

db.sync({
  alter: true,
}).then(() => {
  seed();
});
