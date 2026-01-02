import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyGetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import SeasonTeam from "./seasonTeam";
import User from "./user";
import Club from "./club";
import db from "../db";

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
class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
  declare id: CreationOptional<string>;
  declare name: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Club: NonAttribute<Club>;
  declare ClubId: ForeignKey<Club["id"]>;

  declare SeasonTeams: NonAttribute<SeasonTeam[]>;

  declare getSeasonTeams: HasManyGetAssociationsMixin<SeasonTeam>;
}

Team.init(
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    paranoid: true,
    hooks: {
      afterDestroy: function (instance, _options) {
        instance.getSeasonTeams().then((seasonTeamList) => {
          seasonTeamList.forEach((st) => st.destroy());
        });
      },
    },
  },
);

export default Team;
