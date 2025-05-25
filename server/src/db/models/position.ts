import { BelongsToSetAssociationMixin, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import User from "./user";
import Lineup from "./lineup";
import Member from "./member";
import db from "../db";

/**
 * @openapi
 * components:
 *  schemas:
 *    Position:
 *      type: object
 *      required:
 *      - id
 *      - x
 *      - y
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        x:
 *          type: number
 *        y:
 *          type: number
 */

/**
 * @typedef Position
 * @property {UUID} id
 * @property {number} x
 * @property {number} y
 * @property {UUID} UserId
 * @memberof module:Models
 */

class Position extends Model<InferAttributes<Position>, InferCreationAttributes<Position>> {
  declare id: CreationOptional<string>;
  declare x: number;
  declare y: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Lineup: NonAttribute<Lineup>;
  declare LineupId: ForeignKey<Lineup["id"]>;

  declare Member: NonAttribute<Member>;
  declare MemberId: ForeignKey<Member["id"]>;

  declare setMember: BelongsToSetAssociationMixin<Member, Member["id"]>;
}

Position.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    x: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    y: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
  });

export default Position;
