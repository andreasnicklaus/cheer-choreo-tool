const { Sequelize, DataTypes } = require("sequelize");
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

module.exports = db;

const Club = require("./models/club");
const Member = require("./models/member");
const Team = require("./models/team");
const Choreo = require("./models/choreo");
const Lineup = require("./models/lineup");
const Hit = require("./models/hit");
const Position = require("./models/position");
const User = require("./models/user");
const Season = require("./models/season");
const SeasonTeam = require("./models/seasonTeam");
const seed = require("./seed");
const ChoreoParticipation = require("./models/choreoParticipation");
const Feedback = require("./models/feedback");
const Admin = require("./models/admin");

Team.hasMany(SeasonTeam, {
  onDelete: "CASCADE",
});
SeasonTeam.belongsTo(Team);
SeasonTeam.hasMany(Member, {
  onDelete: "CASCADE",
});
Member.belongsTo(SeasonTeam);

Season.hasMany(SeasonTeam, {
  onDelete: "CASCADE",
});
SeasonTeam.belongsTo(Season);

Club.hasMany(Team, {
  onDelete: "CASCADE",
});
Team.belongsTo(Club);

SeasonTeam.hasMany(Choreo, {
  onDelete: "CASCADE",
});
Choreo.belongsTo(SeasonTeam);

Choreo.hasMany(Lineup, {
  onDelete: "CASCADE",
});
Lineup.belongsTo(Choreo);

Choreo.hasMany(Hit, {
  onDelete: "CASCADE",
});
Hit.belongsTo(Choreo);

Choreo.belongsToMany(Member, {
  through: ChoreoParticipation,
  as: "Participants",
});
Member.belongsToMany(Choreo, {
  through: ChoreoParticipation,
});

Hit.belongsToMany(Member, { through: "HitMemberships" });
Member.belongsToMany(Hit, { through: "HitMemberships" });

Lineup.hasMany(Position, {
  onDelete: "CASCADE",
});
Position.belongsTo(Lineup);

Member.hasMany(Position, {
  onDelete: "CASCADE",
});
Position.belongsTo(Member);

User.hasMany(Club, {
  onDelete: "CASCADE",
});
Club.belongsTo(User);

User.hasMany(Team, {
  onDelete: "CASCADE",
});
Team.belongsTo(User);

User.hasMany(SeasonTeam, {
  onDelete: "CASCADE",
});
SeasonTeam.belongsTo(User);

User.hasMany(Member, {
  onDelete: "CASCADE",
});
Member.belongsTo(User);

User.hasMany(Choreo, {
  onDelete: "CASCADE",
});
Choreo.belongsTo(User);

User.hasMany(Lineup, {
  onDelete: "CASCADE",
});
Lineup.belongsTo(User);

User.hasMany(Position, {
  onDelete: "CASCADE",
});
Position.belongsTo(User);

User.hasMany(Hit, {
  onDelete: "CASCADE",
});
Hit.belongsTo(User);

User.hasMany(Season, {
  onDelete: "CASCADE",
});
Season.belongsTo(User);

Feedback.belongsTo(User);
User.hasMany(Feedback);

db.sync({
  alter: true,
}).then(() => {
  seed();
});
