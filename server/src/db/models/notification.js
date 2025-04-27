const { DataTypes } = require("sequelize");
const db = require("..");

const Notification = db.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [5, 40],
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 300],
      },
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Notification;
