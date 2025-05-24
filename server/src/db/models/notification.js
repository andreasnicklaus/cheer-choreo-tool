const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Notification:
 *      type: object
 *      required:
 *      - id
 *      - title
 *      - message
 *      - read
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        title:
 *          type: string
 *        message:
 *          type: string
 *        read:
 *          type: boolean
 *          default: false
 */

/**
 * @typedef Notification
 * @property {UUID} id
 * @property {string} title
 * @property {string} message
 * @property {boolean} read
 * @property {UUID} UserId
 * @memberof module:Models
 */

const NotificationModel = db.define(
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

module.exports = NotificationModel;
