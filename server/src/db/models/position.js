const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Position:
 *      type: object
 *      required:
 *      - id
 *      - x
 *      - y
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        x:
 *          type: number
 *        y:
 *          type: number
 */

/**
 * @typedef Position
 * @property {UUID} id
 * @property {number} x
 * @property {number} y
 * @property {UUID} UserId
 * @memberof module:Models
 */

const Position = db.define("Position", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  x: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  y: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
});

module.exports = Position;
