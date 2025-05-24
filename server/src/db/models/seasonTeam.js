const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @typedef SeasonTeam
 * @property {UUID} id
 * @property {UUID} UserId
 * @memberof module:Models
 */
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
      afterDestroy: function (instance, _options) {
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
