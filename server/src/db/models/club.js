const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Club:
 *      type: object
 *      required:
 *      - id
 *      - name
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        name:
 *          type: string
 *        logoExtension:
 *          type: string
 *          example: .png
 */

const Club = db.define(
  "Club",
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
    logoExtension: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    afterDestroy: function (instance, options) {
      instance
        .getTeams()
        .then((teamList) => teamList.forEach((team) => team.destroy()));
    },
  }
);

module.exports = Club;
