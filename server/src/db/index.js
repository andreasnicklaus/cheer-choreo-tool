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
const Lineup = require("./models/Lineup");
const Hit = require("./models/hit");
const Position = require("./models/position");
const seed = require("./seed");

Team.hasMany(Member);
Member.belongsTo(Team);

Club.hasMany(Team);
Team.belongsTo(Club);

Team.hasMany(Choreo);
Choreo.belongsTo(Team);

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

db.sync({
  alter: true,
}).then(() => {
  seed().then(() => {
    setTimeout(async () => {
      console.log(
        JSON.stringify(
          await Member.findAll({
            where: {
              name: "Aleyna Ortmann",
            },
          }),
          null,
          2
        )
      );
    }, 2000);
  });
});
