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
import Team from "./team";
import User from "./user";
import db from "../db";

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

/**
 * @typedef Club
 * @property {UUID} id
 * @property {string} name
 * @property {string} [logoExtension]
 * @property {UUID} UserId
 * @memberof module:Models
 */
class Club extends Model<InferAttributes<Club>, InferCreationAttributes<Club>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare logoExtension?: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare User: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Teams: NonAttribute<Team[]>;

  declare getTeams: HasManyGetAssociationsMixin<Team>;
}

Club.init(
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    paranoid: true,
    hooks: {
      afterDestroy: function (instance: Club, _options) {
        instance
          .getTeams()
          .then((teamList) => teamList.forEach((team) => team.destroy()));
      },
    },
  },
);

export default Club;
