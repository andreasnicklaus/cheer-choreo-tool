const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Lineup:
 *      type: object
 *      required:
 *      - id
 *      - startCount
 *      - endCount
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        startCount:
 *          type: integer
 *          minimum: 0
 *        endCount:
 *          type: integer
 *          minimum: 0
 */

const Lineup = db.define(
  "Lineup",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    startCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    endCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    validate: {
      endIsAfterStart() {
        if (this.startCount > this.endCount)
          throw new Error(
            `endCount (count: ${this.endCount}) cannot be before startCount (count: ${this.startCount})`
          );
      },
    },
  }
);

module.exports = Lineup;
