const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Feedback:
 *      type: object
 *      required:
 *      - id
 *      - stars
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        stars:
 *          type: integer
 *          minimum: 1
 *          maximum: 5
 *        text:
 *          type: string
 */

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
