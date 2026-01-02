import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import User from "./user";
import SeasonTeam from "./seasonTeam";
import db from "../db";

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

/**
 * @typedef Season
 * @property {UUID} id
 * @property {number} [year]
 * @property {string} name
 * @property {UUID} UserId
 * @memberof module:Models
 */
class Season extends Model<
  InferAttributes<Season>,
  InferCreationAttributes<Season>
> {
  declare id: CreationOptional<string>;
  declare year?: number;
  declare name: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare SeasonTeams: NonAttribute<SeasonTeam[]>;
}

Season.init(
  {
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
  },
);

export default Season;
