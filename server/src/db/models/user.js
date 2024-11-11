const { DataTypes } = require("sequelize");
const db = require("..");
const bcrypt = require("bcrypt");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [6, 999],
          msg: "Nutzername muss mindestens 6 Zeichen haben",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10, "a");
        this.setDataValue("password", bcrypt.hashSync(value, salt));
      },
    },
  },
  {
    defaultScope: {
      attributes: {
        exclude: "password",
      },
    },
    scopes: {
      withPasswordHash: {
        attributes: {},
      },
    },
    paranoid: true,
    afterDestroy: function (instance, options) {
      instance
        .getClubs()
        .then((clubList) => clubList.forEach((club) => club.destroy()));
    },
  }
);

module.exports = User;
