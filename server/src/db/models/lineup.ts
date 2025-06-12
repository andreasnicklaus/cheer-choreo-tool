import { CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import User from "./user";
import Choreo from "./choreo";
import Position from "./position";
import db from "../db";
import logger from "../../plugins/winston";

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
/**
 * @typedef Lineup
 * @property {UUID} id
 * @property {number} startCount
 * @property {number} endCount
 * @property {UUID} UserId
 * @memberof module:Models
 */
class Lineup extends Model<InferAttributes<Lineup>, InferCreationAttributes<Lineup>> {
  declare id: CreationOptional<string>;
  declare startCount: number;
  declare endCount: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Choreo: NonAttribute<Choreo>;
  declare ChoreoId: ForeignKey<Choreo["id"]>;

  declare Positions: NonAttribute<Position[]>;

  declare addPosition: HasManyAddAssociationMixin<Position, Position["id"]>;
}

Lineup.init(
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    validate: {
      endIsAfterStart(this: Lineup) {
        if (this.startCount > this.endCount) {
          logger.error(
            `endCount (count: ${this.endCount}) cannot be before startCount (count: ${this.startCount})`
          );
          throw new Error(
            `endCount (count: ${this.endCount}) cannot be before startCount (count: ${this.startCount})`
          );
        }
      },
    },
  }
);

export default Lineup;