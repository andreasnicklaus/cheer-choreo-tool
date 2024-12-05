const { DataTypes } = require("sequelize");
const db = require("..");

const Feedback = db.define(
  "Feedback",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        max: 5,
        min: 1,
      },
    },
    text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Feedback;
