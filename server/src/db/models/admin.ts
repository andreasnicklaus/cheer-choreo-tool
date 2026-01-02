import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import db from "../db";
const bcrypt = require("bcrypt");

/**
 * @openapi
 * components:
 *  schemas:
 *    Admin:
 *      type: object
 *      required:
 *      - id
 *      - username
 *      - password
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        username:
 *          type: string
 *        password:
 *          type: string
 *          format: password
 */
/**
 * @typedef Admin
 * @property {UUID} id
 * @property {string} username
 * @memberof module:Models
 */
class Admin extends Model<
  InferAttributes<Admin>,
  InferCreationAttributes<Admin>
> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare password: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [6, 999],
          msg: "Username has to be at least 6 characters",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10, "a");
        this.setDataValue("password", bcrypt.hashSync(value, salt));
      },
    },
    // technically, `createdAt` & `updatedAt` are added by Sequelize and don't need to be configured in Model.init
    // but the typings of Model.init do not know this. Add the following to mute the typing error:
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
    scopes: {
      withPasswordHash: {
        attributes: {
          exclude: [],
        },
      },
    },
    paranoid: true,
  },
);

export default Admin;
