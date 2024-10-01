const { Op } = require("sequelize");
const Member = require("../db/models/member");
const { logger } = require("../plugins/winston");

const defaultColors = [
  "#FF1493",
  "#C71585",
  "#4B0082",
  "#9400D3",
  "#6A5ACD",
  "#8B0000",
  "#B22222",
  "#FF4500",
  "#FF8C00",
  "#006400",
  "#228B22",
  "#00008B",
  "#0000FF",
  "#1E90FF",
  "#A52A2A",
  "#008080",
  "#48D1CC",
  "#00FFFF",
  "#2F4F4F",
  "#FFFF00",
];

class MemberService {
  async findAll(UserId) {
    return Member.getAll({ where: { UserId } });
  }

  async findById(id, UserId) {
    return Club.findOne({ where: { id, UserId } });
  }

  async create(name, nickname, abbreviation, color, TeamId, UserId) {
    if (!abbreviation)
      abbreviation = name
        .split(" ")
        .map((s) => s.substring(0, 1))
        .join("");

    if (!color)
      color = defaultColors[Math.floor(Math.random() * defaultColors.length)];

    logger.debug(
      `MemberService.create ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        color,
        TeamId,
        UserId,
      })}`
    );
    return Member.create({
      name,
      nickname,
      abbreviation,
      color,
      TeamId,
      UserId,
    });
  }

  async findOrCreate(name, nickname, abbreviation, color, TeamId, UserId) {
    logger.debug(
      `MemberService.findOrCreate ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        color,
        TeamId,
        UserId,
      })}`
    );

    const defaultAbbreviation = name
      .split(" ")
      .map((s) => s.substring(0, 1))
      .join("");

    const [member, created] = await Member.findOrCreate({
      where: {
        name,
        nickname,
        abbreviation: abbreviation || defaultAbbreviation,
        TeamId,
        UserId,
      },
      defaults: {
        color:
          color ||
          defaultColors[Math.floor(Math.random() * defaultColors.length)],
      },
    });
    return member;
  }

  async update(id, data, UserId) {
    return Member.findOne({ where: { id, UserId } }).then(
      async (foundMember) => {
        if (foundMember) {
          logger.debug(
            `MemberService.update ${JSON.stringify({ id, data, UserId })}`
          );
          await foundMember.update(data);
          await foundMember.save();
          return Member.findOne({ where: { id, UserId } });
        } else {
          throw Error(
            `Beim Update wurde kein Member mit der ID ${id} gefunden`
          );
        }
      }
    );
  }

  async remove(id, UserId) {
    return Member.findOne({ where: { id, UserId } }).then((foundMember) => {
      if (foundMember) {
        logger.debug(`MemberService.remove ${JSON.stringify({ id, UserId })}`);
        return foundMember.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Member mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new MemberService();
