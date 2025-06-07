import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import User from "./user";
import db from "../db";

/**
 * @openapi
 * components:
 *  schemas:
 *    Notification:
 *      type: object
 *      required:
 *      - id
 *      - title
 *      - message
 *      - read
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        title:
 *          type: string
 *        message:
 *          type: string
 *        read:
 *          type: boolean
 *          default: false
 */

/**
 * @typedef Notification
 * @property {UUID} id
 * @property {string} title
 * @property {string} message
 * @property {boolean} read
 * @property {UUID} UserId
 * @memberof module:Models
 */
class NotificationModel extends Model<InferAttributes<NotificationModel>, InferCreationAttributes<NotificationModel>> {
  declare id: CreationOptional<string>;
  declare title?: CreationOptional<string>;
  declare message: string;
  declare read: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;
}

NotificationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [5, 40],
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 300],
      },
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

export default NotificationModel;