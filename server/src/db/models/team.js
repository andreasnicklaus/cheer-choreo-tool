const { DataTypes } = require("sequelize");
const db = require("..");

/**
 * @openapi
 * components:
 *  schemas:
 *    Team:
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
 */

/**
 * @typedef Team
 * @property {UUID} id
 * @property {string} name
 * @property {UUID} UserId
 * @memberof module:Models
 */

const Team = db.define(
  "Team",
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
  },
  {
    paranoid: true,
    hooks: {
      afterDestroy: function (instance, _options) {
        instance.getSeasonTeams().then((seasonTeamList) => {
          seasonTeamList.forEach((st) => st.destroy());
        });
      },
    },
  }
);

module.exports = Team;
