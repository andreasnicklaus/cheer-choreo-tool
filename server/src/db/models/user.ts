import {
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import Club from "./club";
import Team from "./team";
import SeasonTeam from "./seasonTeam";
import Member from "./member";
import Choreo from "./choreo";
import Lineup from "./lineup";
import Position from "./position";
import Hit from "./hit";
import Season from "./season";
import Feedback from "./feedback";
import NotificationModel from "./notification";
import db from "../db";
const bcrypt = require("bcrypt");

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *      - id
 *      - username
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        username:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        emailConfirmed:
 *          type: boolean
 *          default: false
 *        profilePictureExtension:
 *          type: string
 *          example: .png
 *        password:
 *          type: string
 *          format: password
 *        lastLoggedIn:
 *          type: string
 *          format: date-time
 */

/**
 * @typedef User
 * @property {UUID} id
 * @property {string} username
 * @property {string} [email]
 * @property {boolean} [emailConfirmed]
 * @property {string} [profilePictureExtension]
 * @property {string} password
 * @property {Date} [lastLoggedIn]
 * @memberof module:Models
 */
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email?: string;
  declare emailConfirmed: CreationOptional<boolean>;
  declare profilePictureExtension?: string;
  declare password: string;
  declare lastLoggedIn?: Date;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare clubs: NonAttribute<Club[]>;
  declare teams: NonAttribute<Team[]>;
  declare seasonTeams: NonAttribute<SeasonTeam[]>;
  declare members: NonAttribute<Member[]>;
  declare choreos: NonAttribute<Choreo[]>;
  declare lineups: NonAttribute<Lineup[]>;
  declare positions: NonAttribute<Position[]>;
  declare hits: NonAttribute<Hit[]>;
  declare seasons: NonAttribute<Season[]>;
  declare feedbacks: NonAttribute<Feedback[]>;
  declare notifications: NonAttribute<NotificationModel[]>;

  declare getClubs: HasManyGetAssociationsMixin<Club>;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: {
          msg: "Email has to be correct email format, e.g. info@choreo-planer.de",
        },
      },
    },
    emailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    profilePictureExtension: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10, "a");
        this.setDataValue("password", bcrypt.hashSync(value, salt));
      },
    },
    lastLoggedIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
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
    hooks: {
      afterDestroy: function (instance, _options) {
        instance
          .getClubs()
          .then((clubList) => clubList.forEach((club) => club.destroy()));
      },
    },
  },
);

export default User;
