const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Choreo:
 *      type: object
 *      required:
 *      - id
 *      - name
 *      - counts
 *      - matType
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        name:
 *          type: string
 *        counts:
 *          type: integer
 *          minimum: 0
 *        matType:
 *          type: string
 *          enum:
 *          - cheer
 *          - square
 *          - 1:2
 *          - 3:4
 *          default: cheer
 */

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
