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
    matType: {
      type: DataTypes.ENUM("cheer", "square", "1:2", "3:4"),
      defaultValue: "cheer",
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Choreo;
