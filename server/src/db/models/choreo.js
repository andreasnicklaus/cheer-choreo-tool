const { DataTypes } = require("sequelize");
const db = require("..");

const Choreo = db.define(
  "Choreo",
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
    counts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Choreo;
