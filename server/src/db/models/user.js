const { DataTypes } = require("sequelize");
const db = require("..");
const bcrypt = require("bcrypt");

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *      - id
 *      - username
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        username:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        emailConfirmed:
 *          type: boolean
 *          default: false
 *        profilePictureExtension
 *          type: string
 *          example: .png
 *        password:
 *          type: string
 *          format: password
 *        lastLoggedIn:
 *          type: string
 *          format: date-time
 */

/**
 * @typedef User
 * @property {UUID} id
 * @property {string} username
 * @property {string} [email]
 * @property {boolean} [emailConfirmed]
 * @property {string} [profilePictureExtension]
 * @property {string} password
 * @property {Date} [lastLoggedIn]
 * @memberof module:Models
 */

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
          msg: "Username has to be at least 6 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: {
          msg: "Email has to be correct email format, e.g. info@choreo-planer.de",
        },
      },
    },
    emailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    profilePictureExtension: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10, "a");
        this.setDataValue("password", bcrypt.hashSync(value, salt));
      },
    },
    lastLoggedIn: {
      type: DataTypes.DATE,
      allowNull: true,
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
