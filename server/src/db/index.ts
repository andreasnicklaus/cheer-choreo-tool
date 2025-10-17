import db from "./db";
import Choreo from "./models/choreo";
import ChoreoParticipation from "./models/choreoParticipation";
import Club from "./models/club";
import Feedback from "./models/feedback";
import Hit from "./models/hit";
import Lineup from "./models/lineup";
import Member from "./models/member";
import NotificationModel from "./models/notification";
import Position from "./models/position";
import Season from "./models/season";
import SeasonTeam from "./models/seasonTeam";
import Team from "./models/team";
import User from "./models/user";
import seed from "./seed";
require("./models/admin");

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

NotificationModel.belongsTo(User);
User.hasMany(NotificationModel);

const syncPromise = db
  .sync({
    alter: true,
  })
  .then(() => (process.env.NODE_ENV == "test" ? Promise.resolve() : seed()));

export { syncPromise };
export default db;
