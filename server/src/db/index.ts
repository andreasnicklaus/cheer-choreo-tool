import db from "./db";
import Choreo from "@/db/models/choreo";
import ChoreoParticipation from "@/db/models/choreoParticipation";
import Club from "@/db/models/club";
import Feedback from "@/db/models/feedback";
import Hit from "@/db/models/hit";
import Lineup from "@/db/models/lineup";
import Member from "@/db/models/member";
import NotificationModel from "@/db/models/notification";
import Position from "@/db/models/position";
import Season from "@/db/models/season";
import SeasonTeam from "@/db/models/seasonTeam";
import Team from "@/db/models/team";
import User from "@/db/models/user";
import UserAccess from "@/db/models/userAccess";
import seed from "./seed";
import migrate from "./migrations";
require("@/db/models/admin");

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
ChoreoParticipation.belongsTo(Choreo);
ChoreoParticipation.belongsTo(Member);

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

User.hasMany(UserAccess, {
  as: "childAccess",
  foreignKey: "childUserId",
  onDelete: "CASCADE",
});
UserAccess.belongsTo(User, {
  as: "child",
  foreignKey: "childUserId",
});

User.hasMany(UserAccess, {
  as: "ownerAccess",
  foreignKey: "ownerUserId",
  onDelete: "CASCADE",
});
UserAccess.belongsTo(User, {
  as: "owner",
  foreignKey: "ownerUserId",
});

Club.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Club.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Team.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Team.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

SeasonTeam.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
SeasonTeam.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Member.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Member.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Choreo.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Choreo.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Lineup.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Lineup.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Position.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Position.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Hit.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Hit.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Season.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Season.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

Feedback.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
Feedback.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

NotificationModel.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
NotificationModel.belongsTo(User, { as: "updater", foreignKey: "updaterId" });

const syncPromise = db
  .sync({ alter: true })
  .then(() => (process.env.NODE_ENV == "test" ? Promise.resolve() : seed()))
  .then(migrate);

export { syncPromise };
export default db;
