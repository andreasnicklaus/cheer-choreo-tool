import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  ForeignKey,
  BelongsToManyCreateAssociationMixin,
} from "sequelize";
import Team from "./team";
import Lineup from "./lineup";
import Hit from "./hit";
import User from "./user";
import SeasonTeam from "./seasonTeam";
import ChoreoParticipation from "./choreoParticipation";
import Member from "./member";
import db from "../db";

export type MatType = "cheer" | "square" | "1:2" | "3:4";
export const defaultMatType: MatType = "cheer";

/**
 * @openapi
 * components:
 *  schemas:
 *    Choreo:
 *      type: object
 *      required:
 *      - id
 *      - name
 *      - counts
 *      - matType
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *        name:
 *          type: string
 *        counts:
 *          type: integer
 *          minimum: 0
 *        matType:
 *          type: string
 *          enum:
 *          - cheer
 *          - square
 *          - 1:2
 *          - 3:4
 *          default: cheer
 */
/**
 * @typedef Choreo
 * @property {UUID} id
 * @property {string} name
 * @property {number} counts
 * @property {MatType} matType
 * @property {UUID} UserId
 * @memberof module:Models
 */
/**
 * @typedef {('cheer'|'square'|'1:2'|'3:4')} MatType
 * @memberof module:Models
 */
class Choreo extends Model<
  InferAttributes<Choreo>,
  InferCreationAttributes<Choreo>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare counts: number;
  declare matType: MatType;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  declare team: NonAttribute<Team>;
  declare TeamId: ForeignKey<Team["id"]>;

  declare seasonTeam: NonAttribute<SeasonTeam>;
  declare SeasonTeamId: ForeignKey<Team["id"]>;

  declare user: NonAttribute<User>;
  declare UserId: ForeignKey<User["id"]>;

  declare Lineups: NonAttribute<Lineup[]>;
  declare Hits: NonAttribute<Hit[]>;
  declare Participants: NonAttribute<ChoreoParticipation[]>;

  declare addParticipant: BelongsToManyCreateAssociationMixin<Member>;
}

Choreo.init(
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
    counts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    matType: {
      type: DataTypes.ENUM("cheer", "square", "1:2", "3:4"),
      defaultValue: defaultMatType,
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

export default Choreo;
