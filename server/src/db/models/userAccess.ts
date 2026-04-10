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
import db from "../db";

export enum AccessRole {
  COACH = "coach",
  ASSISTANT = "assistant",
  ATHLETE = "athlete",
}

/**
 * @openapi
 * components:
 *  schemas:
 *    UserAccess:
 *      type: object
 *      required:
 *      - id
 *      - ownerUserId
 *      - childUserId
 *      - role
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        ownerUserId:
 *          type: string
 *          format: uuid
 *        childUserId:
 *          type: string
 *          format: uuid
 *        role:
 *          type: string
 *          enum:
 *          - coach
 *          - assistant
 *          - athlete
 *        enabled:
 *          type: boolean
 *          default: true
 */

/**
 * @typedef UserAccess
 * @property {UUID} id
 * @property {UUID} ownerUserId
 * @property {UUID} childUserId
 * @property {AccessRole} role
 * @property {boolean} enabled
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @memberof module:Models
 */
class UserAccess extends Model<
  InferAttributes<UserAccess>,
  InferCreationAttributes<UserAccess>
> {
  declare id: CreationOptional<string>;
  declare ownerUserId: ForeignKey<User["id"]>;
  declare childUserId: ForeignKey<User["id"]>;
  declare role: AccessRole;
  declare enabled: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare owner: NonAttribute<User>;
  declare child: NonAttribute<User>;
}

UserAccess.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    childUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(AccessRole)),
      allowNull: false,
      defaultValue: AccessRole.ATHLETE,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    indexes: [
      {
        unique: true,
        fields: ["ownerUserId", "childUserId"],
      },
    ],
  },
);

export default UserAccess;