const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Season:
 *      type: object
 *      required:
 *      - id
 *      - name
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        year:
 *          type: integer
 *        name:
 *          type: string
 */

/**
 * @typedef Season
 * @property {UUID} id
 * @property {number} [year]
 * @property {string} name
 * @property {UUID} UserId
 * @memberof module:Models
 */

const Season = db.define("Season", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1900,
      max: 2999,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Season;
