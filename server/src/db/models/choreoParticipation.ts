import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import User from "./user";
import Choreo from "./choreo";
import Member from "./member";
import db from "../db";


/**
 * @typedef ChoreoParticipation
 * @property {UUID} id
 * @property {string} color
 * @memberof module:Models
 */
class ChoreoParticipation extends Model<InferAttributes<ChoreoParticipation>, InferCreationAttributes<ChoreoParticipation>> {
  declare id: string;
  declare color?: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare choreo: NonAttribute<Choreo>;
  declare ChoreoId: ForeignKey<Choreo["id"]>;
  declare member: NonAttribute<Member>;
  declare MemberId: ForeignKey<Member["id"]>;
}

ChoreoParticipation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    color: {
      type: DataTypes.STRING,
      validate: {
        is: /#[0-9a-fA-F]{6}/i,
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize: db }
);

export default ChoreoParticipation;