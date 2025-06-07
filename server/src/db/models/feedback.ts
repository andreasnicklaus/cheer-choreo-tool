import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import User from "./user";
import db from "../db";

/**
 * @openapi
 * components:
 *  schemas:
 *    Feedback:
 *      type: object
 *      required:
 *      - id
 *      - stars
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        stars:
 *          type: integer
 *          minimum: 1
 *          maximum: 5
 *        text:
 *          type: string
 */

/**
 * @typedef Feedback
 * @property {UUID} id
 * @property {number} stars
 * @property {string} [text]
 * @property {UUID} [UserId]
 * @memberof module:Models
 */
class Feedback extends Model<InferAttributes<Feedback>, InferCreationAttributes<Feedback>> {
  declare id: CreationOptional<string>;
  declare stars: number;
  declare text?: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare User: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;
}

Feedback.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        max: 5,
        min: 1,
      },
    },
    text: {
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
  }
);

export default Feedback;