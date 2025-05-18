const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Member:
 *      type: object
 *      required:
 *      - id
 *      - name
 *      - abbreviation
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        name:
 *          type: string
 *        nickname:
 *          type: string
 *        abbreviation:
 *          type: string
 */

const Member = db.define(
  "Member",
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
    nickname: {
      type: DataTypes.STRING,
    },
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Member;
