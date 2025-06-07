import { CreationOptional, DataTypes, ForeignKey, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import Member from "./member";
import Choreo from "./choreo";
import User from "./user";
import Team from "./team";
import Season from "./season";
import db from "../db";

/**
 * @openapi
 * components:
 *  schemas:
 *    SeasonTeam:
 *      type: object
 *      required:
 *      - id
 *      - UserId
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        UserId:
 *          type: string
 *          format: uuid
 */
/**
 * @typedef SeasonTeam
 * @property {UUID} id
 * @property {UUID} UserId
 * @memberof module:Models
 */
class SeasonTeam extends Model<InferAttributes<SeasonTeam>, InferCreationAttributes<SeasonTeam>> {
  declare id: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare User: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Team: NonAttribute<Team>;
  declare TeamId: ForeignKey<Team["id"]>;

  declare Season: NonAttribute<Season>;
  declare SeasonId: ForeignKey<Season["id"]>;

  declare Members: NonAttribute<Member[]>;
  declare Choreos: NonAttribute<Choreo[]>;

  declare getMembers: HasManyGetAssociationsMixin<Member>;
  declare getChoreos: HasManyGetAssociationsMixin<Choreo>;
}

SeasonTeam.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
        instance.getMembers().then((memberList) => {
          memberList.forEach((m) => m.destroy());
        });
        instance.getChoreos().then((choreoList) => {
          choreoList.forEach((choreo) => choreo.destroy());
        });
      },
    },
  }
);

export default SeasonTeam;