const { DataTypes } = require("sequelize");
const db = require("..");

const ChoreoParticipation = db.define("ChoreoParticipation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  color: {
    type: DataTypes.STRING,
    validate: {
      is: /#[0-9a-fA-F]{6}/i,
    },
  },
});

module.exports = ChoreoParticipation;
