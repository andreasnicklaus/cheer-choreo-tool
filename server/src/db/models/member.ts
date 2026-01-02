import {
  BelongsToManyCreateAssociationMixin,
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
import ChoreoParticipation from "./choreoParticipation";
import db from "../db";

/**
 * @openapi
 * components:
 *  schemas:
 *    Member:
 *      type: object
 *      required:
 *      - id
 *      - name
 *      - abbreviation
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        name:
 *          type: string
 *        nickname:
 *          type: string
 *        abbreviation:
 *          type: string
 */

/**
 * @typedef Member
 * @augments Model
 * @property {UUID} id
 * @property {string} name
 * @property {string} [nickname]
 * @property {string} abbreviation
 * @property {UUID} UserId
 * @memberof module:Models
 */
class Member extends Model<
  InferAttributes<Member>,
  InferCreationAttributes<Member>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare nickname?: string;
  declare abbreviation: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare SeasonTeam: NonAttribute<SeasonTeam>;
  declare SeasonTeamId: ForeignKey<SeasonTeam["id"]>;

  declare addParticipation: BelongsToManyCreateAssociationMixin<ChoreoParticipation>;
}

Member.init(
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
    nickname: {
      type: DataTypes.STRING,
    },
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    paranoid: true,
  },
);

export default Member;
