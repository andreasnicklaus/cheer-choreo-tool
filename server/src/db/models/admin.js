const { DataTypes } = require("sequelize");
const db = require("..");
const bcrypt = require("bcrypt");

const Admin = db.define(
  "Admin",
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
          msg: "Username has to be at least 6 characters",
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
  }
);

module.exports = Admin;
