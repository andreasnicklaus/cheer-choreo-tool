const { Op } = require("sequelize");
const Admin = require("../db/models/admin");
const { logger } = require("../plugins/winston");

/**
 * Service for managing admin entities and their operations.
 * Handles CRUD operations and admin-specific logic.
 *
 * @class AdminService
 */
class AdminService {
  /**
   * Find or create an Admin by username. If not found, creates a new Admin with the given password.
   * @async
   * @param {string} username - The admin's username.
   * @param {string} password - The admin's password.
   * @returns {Promise<Admin>} The found or newly created Admin instance.
   */
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

  /**
   * Find an Admin by username.
   * @param {string} username - The admin's username.
   * @param {Object} options - Options object.
   * @param {string} [options.scope="defaultScope"] - Sequelize scope to use.
   * @returns {Promise<Admin|null>} The found Admin or null if not found.
   */
  findByUsername(username, { scope = "defaultScope" }) {
    return Admin.scope(scope).findOne({ where: { username } }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Find an Admin by its ID.
   * @param {UUID} id - The admin's UUID.
   * @returns {Promise<Admin|null>} The found Admin or null if not found.
   */
  findById(id) {
    return Admin.findByPk(id);
  }

  /**
   * Get the total number of Admins in the database.
   * @async
   * @returns {Promise<number>} The count of Admins.
   */
  getCount() {
    return Admin.count();
  }

  /**
   * Get all Admins in the database.
   * @async
   * @returns {Promise<Admin[]>} Array of all Admins.
   */
  getAll() {
    return Admin.findAll();
  }

  /**
   * Get the trend of Admins (new minus deleted) in the last 30 days.
   * @async
   * @returns {Promise<number>} The net number of Admins added in the last 30 days.
   */
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

  /**
   * Update an Admin by ID.
   * @async
   * @param {UUID} id - The admin's UUID.
   * @param {Object} data - The update data.
   * @returns {Promise<Admin>} The updated Admin instance.
   * @throws {Error} If no Admin with the given ID is found.
   */
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

  /**
   * Delete an Admin by ID.
   * @async
   * @param {UUID} id - The admin's UUID.
   * @returns {Promise<void>} Resolves if deletion is successful.
   * @throws {Error} If no Admin with the given ID is found.
   */
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
