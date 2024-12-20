const { Op } = require("sequelize");
const Member = require("../db/models/member");
const { logger } = require("../plugins/winston");

class MemberService {
  async getAll(UserId, options = { all: false }) {
    return Member.findAll({ where: options.all ? {} : { UserId } });
  }

  async findById(id, UserId) {
    return Member.findOne({ where: { id, UserId } });
  }

  getCount() {
    return Member.count();
  }

  getTrend() {
    return Promise.all([
      Member.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Member.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  async create(name, nickname, abbreviation, SeasonTeamId, UserId) {
    if (!abbreviation)
      abbreviation = name
        .split(" ")
        .map((s) => s.substring(0, 1))
        .join("");

    logger.debug(
      `MemberService.create ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        SeasonTeamId,
        UserId,
      })}`
    );
    return Member.create({
      name,
      nickname,
      abbreviation,
      SeasonTeamId,
      UserId,
    });
  }

  async findOrCreate(name, nickname, abbreviation, SeasonTeamId, UserId) {
    logger.debug(
      `MemberService.findOrCreate ${JSON.stringify({
        name,
        nickname,
        abbreviation,
        SeasonTeamId,
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
        SeasonTeamId,
        UserId,
      },
    });
    return member;
  }

  async update(id, data, UserId, options = { all: false }) {
    return Member.findOne({
      where: options.all ? { id } : { id, UserId },
    }).then(async (foundMember) => {
      if (foundMember) {
        logger.debug(
          `MemberService.update ${JSON.stringify({ id, data, UserId })}`
        );
        await foundMember.update(data);
        await foundMember.save();
        return Member.findOne({ where: { id, UserId } });
      } else {
        throw Error(`Beim Update wurde kein Member mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id, UserId, options = { all: false }) {
    return Member.findOne({
      where: options.all ? { id } : { id, UserId },
    }).then((foundMember) => {
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
