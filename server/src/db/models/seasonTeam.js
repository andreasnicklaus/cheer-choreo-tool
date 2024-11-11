const { DataTypes } = require("sequelize");
const db = require("..");

const SeasonTeam = db.define(
  "SeasonTeam",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  },
  {
    paranoid: true,
    hooks: {
      afterDestroy: function (instance, options) {
        instance.getMembers().then((memberList) => {
          memberList.forEach((m) => m.destroy());
        });
        instance.getChoreos().then((choreoList) => {
          choreoList.forEach((choreo) => choreo.destroy());
        });
      },
    },
  }
);

module.exports = SeasonTeam;
