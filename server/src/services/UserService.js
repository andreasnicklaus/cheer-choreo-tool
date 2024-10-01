const User = require("../db/models/user");
const { logger } = require("../plugins/winston");

class UserService {
  async getAll() {
    return User.findAll({ include: { all: true } });
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async findByUsername(username, { scope = "defaultScope" }) {
    return User.scope(scope).findOne({
      where: { username },
    });
  }

  async create(username, password) {
    return User.create({ username, password });
  }

  async findOrCreate(username, password) {
    logger.debug(
      `UserService.findOrCreate ${JSON.stringify({ username, password })}`
    );
    const [user, created] = await User.findOrCreate({
      where: { username },
      defaults: {
        username,
        password,
      },
    });
    return user;
  }

  async update(id, data) {
    return User.findByPk(id).then(async (foundUser) => {
      if (foundUser) {
        logger.debug(`UserService.update ${JSON.stringify({ id, data })}`);
        await foundUser.update(data);
        await foundUser.save();
        return User.findByPk(id, { include: { all: true } });
      } else
        throw Error(`Beim Update wurde kein User mit der ID ${id} gefunden`);
    });
  }

  async remove(id) {
    return User.findByPk(id).then((foundUser) => {
      if (foundUser) {
        logger.debug(`UserService.remove ${JSON.stringify({ id })}`);
        return foundUser.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein Team mit der ID ${id} gefunden`);
      }
    });
  }
}

module.exports = new UserService();