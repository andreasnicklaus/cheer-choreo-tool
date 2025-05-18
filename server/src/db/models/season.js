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
