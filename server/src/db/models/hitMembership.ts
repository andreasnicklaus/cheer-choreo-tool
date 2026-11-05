import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import Hit from "./hit";
import Member from "./member";
import db from "../db";

class HitMembership extends Model<
  InferAttributes<HitMembership>,
  InferCreationAttributes<HitMembership>
> {
  declare HitId: ForeignKey<Hit["id"]>;
  declare MemberId: ForeignKey<Member["id"]>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

HitMembership.init(
  {
    HitId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    MemberId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: db,
    tableName: "HitMemberships",
  },
);

export default HitMembership;
