const { Op } = require("sequelize");
const Admin = require("../db/models/admin");
const { logger } = require("../plugins/winston");

class AdminService {
  async findOrCreate(username, password) {
    logger.debug(
      `AdminService.findOrCreate ${JSON.stringify({ username, password })}`
    );
    const [admin, created] = await Admin.findOrCreate({
      where: { username },
      defaults: {
        username,
        password,
      },
    });
    return admin;
  }

  findByUsername(username, { scope = "defaultScope" }) {
    return Admin.scope(scope).findOne({ where: { username } }); // njsscan-ignore: node_nosqli_injection
  }

  findById(id) {
    return Admin.findByPk(id);
  }

  getCount() {
    return Admin.count();
  }

  getAll() {
    return Admin.findAll();
  }

  getTrend() {
    return Promise.all([
      Admin.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Admin.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  update(id, data) {
    return this.findById(id).then(async (admin) => {
      if (admin) {
        logger.debug(`AdminService.update ${JSON.stringify({ id, data })}`);
        await admin.update(data);
        await admin.save();
        return this.findById(id);
      } else {
        throw new Error(
          `Beim Update wurde kein Admin mit der ID ${id} gefunden`
        );
      }
    });
  }

  remove(id) {
    return this.findById(id).then(async (admin) => {
      if (admin) {
        logger.debug(`AdminService.remove ${JSON.stringify({ id })}`);
        return admin.destroy();
      } else {
        throw new Error(
          `Beim Löschen wurde kein Admin mit der ID ${id} gefunden`
        );
      }
    });
  }
}

module.exports = new AdminService();
