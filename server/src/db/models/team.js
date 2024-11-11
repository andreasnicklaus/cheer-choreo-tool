const { DataTypes } = require("sequelize");
const db = require("..");

const Team = db.define(
  "Team",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
    hooks: {
      afterDestroy: function (instance, options) {
        instance.getSeasonTeams().then((seasonTeamList) => {
          seasonTeamList.forEach((st) => st.destroy());
        });
      },
    },
  }
);

module.exports = Team;
