import { CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, HasManyGetAssociationsMixin, HasManyRemoveAssociationMixin, HasManySetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import User from "./user";
import Choreo from "./choreo";
import Member from "./member";
import db from "../db";

/**
 * @openapi
 * components:
 *  schemas:
 *    Hit:
 *      type: object
 *      required:
 *      - id
 *      - count
 *      - name
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        count:
 *          type: integer
 *          minimum: 0
 *        name:
 *          type: string
 */

/**
 * @typedef Hit
 * @property {UUID} id
 * @property {number} count
 * @property {string} name
 * @property {UUID} UserId
 * @memberof module:Models
 */
class Hit extends Model<InferAttributes<Hit>, InferCreationAttributes<Hit>> {
  declare id: CreationOptional<string>;
  declare count: number;
  declare name: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Choreo: NonAttribute<Choreo>;
  declare ChoreoId: ForeignKey<Choreo["id"]>;

  declare Members: NonAttribute<Member[]>;

  declare getMembers: HasManyGetAssociationsMixin<Member>;
  declare setMembers: HasManySetAssociationsMixin<Member, Member["id"]>;
  declare removeMember: HasManyRemoveAssociationMixin<Member, Member["id"]>;
  declare addMember: HasManyAddAssociationMixin<Member, Member["id"]>;
}

Hit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  }, {
  sequelize: db,
}
);

export default Hit;