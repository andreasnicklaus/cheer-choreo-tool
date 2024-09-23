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

Team.hasMany(Member);

Club.hasMany(Team);
Team.belongsTo(Club);

Team.hasMany(Choreo);
Choreo.belongsTo(Team);

Choreo.hasMany(Lineup);
Lineup.belongsTo(Choreo);

Choreo.hasMany(Hit);
Hit.belongsTo(Choreo);

const ClubService = require("../services/ClubService");
const TeamService = require("../services/TeamService");
const MemberService = require("../services/MemberService");
const ChoreoService = require("../services/ChoreoService");

db.sync({
  force: true,
}).then(() => {
  ClubService.create("Glamourous Cheerleader").then((club) => {
    console.log("TEST CLUB CREATED (club id: " + club.id + ")");
    TeamService.create("Glamourous Blush", club.id).then((team) => {
      console.log("TEST TEAM 1 CREATED (team id: " + team.id + ")");
      const memberData = [
        {
          id: "aaa",
          name: "Anna N",
          nickname: "Anni",
          abbreviation: "AN",
          color: "#ff0000",
        },
        {
          id: "sst",
          name: "Sarah A",
          nickname: null,
          abbreviation: null,
          color: "#ff8888",
        },
        {
          id: "sss",
          name: "Susanna A",
          nickname: null,
          abbreviation: null,
          color: "#5555ff",
        },
        {
          id: "aab",
          name: "Anna N",
          nickname: "Anna",
          abbreviation: null,
          color: "#00ff00",
        },
        {
          id: "jjj",
          name: "Julia",
          nickname: null,
          abbreviation: null,
          color: "#ff00aa",
        },
        {
          id: "mmm",
          name: "Marie",
          nickname: null,
          abbreviation: null,
          color: "#ff99ff",
        },
      ];
      Promise.all(
        memberData.map((mData) => {
          return MemberService.create(
            mData.name,
            mData.nickname,
            mData.abbreviation,
            mData.color,
            team.id
          ).then((member) => {
            console.log(
              `TEST MEMBER ${mData.name} CREATED (member id: ${member.id})`
            );
            return member;
          });
        })
      ).then((members) => {
        return ChoreoService.create(
          "RM 2023",
          200,
          team.id,
          [
            {
              startCount: 0,
              endCount: 2,
            },
          ],
          [
            {
              count: 0,
              name: "Pose",
            },
            {
              count: 0,
              name: "Test",
            },
          ]
        );
      });
    });
    TeamService.create("Glamourous Berry", club.id).then((team) => {
      console.log("TEST TEAM 2 CREATED (team id: " + team.id + ")");
      const memberData = [
        {
          id: "aaa",
          name: "Anna N",
          nickname: "Anni",
          abbreviation: "AN",
          color: "#5555ff",
        },
      ];
      Promise.all(
        memberData.map((mData) => {
          return MemberService.create(
            mData.name,
            mData.nickname,
            mData.abbreviation,
            mData.color,
            team.id
          ).then((member) => {
            console.log(
              `TEST MEMBER ${mData.name} CREATED (member id: ${member.id})`
            );
            return member;
          });
        })
      );
    });
  });
});
