const Member = require("../db/models/member");
const { logger } = require("../plugins/winston");

class MemberService {
  async findAll() {
    console.log(Member.associations);
    return Member.getAll();
  }

  async findById(id) {
    return Club.findByPk(id);
  }

  async create(name, nickname, abbreviation, color, TeamId) {
    logger.debug(
      `MemberService.create ${{ name, nickname, abbreviation, color, TeamId }}`
    );
    return Member.create({ name, nickname, abbreviation, color, TeamId });
  }

  async update(id, data) {
    return Member.findByPk(id).then(async (foundMember) => {
      if (foundMember) {
        logger.debug(`MemberService.update ${{ id, data }}`);
        await foundMember.update(data);
        return foundMember.save();
      } else {
        throw Error(`Beim Update wurde kein Member mit der ID ${id} gefunden`);
      }
    });
  }

  async remove(id) {
    return Member.findByPk(id).then((foundMember) => {
      if (foundMember) {
        logger.debug(`MemberService.remove ${{ id }}`);
        return foundMember.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Member mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new MemberService();
