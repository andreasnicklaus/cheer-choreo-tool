const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Hit:
 *      type: object
 *      required:
 *      - id
 *      - count
 *      - name
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        count:
 *          type: integer
 *          minimum: 0
 *        name:
 *          type: string
 */

const Hit = db.define("Hit", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Hit;
