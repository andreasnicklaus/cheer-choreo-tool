const { DataTypes } = require("sequelize");
const db = require("..");

const Member = db.define("Member", {
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
  },
  color: {
    type: DataTypes.STRING,
    validate: {
      is: /#[0-9a-fA-F]{6}/i,
    },
  },
});

module.exports = Member;
