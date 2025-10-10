import Admin from "../db/models/admin";

const { Op } = require("sequelize");
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
  async findOrCreate(username: string, password: string) {
    logger.debug(
      `AdminService findOrCreate ${JSON.stringify({
        username,
        password: password ? "<redacted>" : "undefined",
      })}`,
    );
    const [admin, _created] = await Admin.findOrCreate({
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
  findByUsername(username: string, { scope = "defaultScope" } = {}) {
    logger.debug(
      `AdminService findByUsername ${JSON.stringify({ username, scope })}`,
    );
    return Admin.scope(scope).findOne({ where: { username } }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Find an Admin by its ID.
   * @param {UUID} id - The admin's UUID.
   * @returns {Promise<Admin|null>} The found Admin or null if not found.
   */
  findById(id: string) {
    logger.debug(`AdminService findById ${JSON.stringify({ id })}`);
    return Admin.findByPk(id);
  }

  /**
   * Get the total number of Admins in the database.
   * @async
   * @returns {Promise<number>} The count of Admins.
   */
  getCount() {
    logger.debug(`AdminService getCount`);
    return Admin.count();
  }

  /**
   * Get all Admins in the database.
   * @async
   * @returns {Promise<Admin[]>} Array of all Admins.
   */
  getAll() {
    logger.debug(`AdminService getAll`);
    return Admin.findAll();
  }

  /**
   * Get the trend of Admins (new minus deleted) in the last 30 days.
   * @async
   * @returns {Promise<number>} The net number of Admins added in the last 30 days.
   */
  getTrend() {
    logger.debug(`AdminService getTrend`);
    return Promise.all([
      Admin.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      Admin.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
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
  update(id: string, data: object & Record<string, unknown>) {
    const { password, ...logdata } = data;
    logger.debug(
      `AdminService update ${JSON.stringify({
        id,
        data: { ...logdata, password: password ? "<redacted>" : "undefined" },
      })}`,
    );
    return this.findById(id).then(async (admin: Admin | null) => {
      if (admin) {
        logger.debug(`AdminService update ${JSON.stringify({ id, data })}`);
        await admin.update(data);
        await admin.save();
        return this.findById(id);
      } else {
        logger.error(`No admin found with ID ${id} when updating`);
        throw new Error(`No admin found with ID ${id} when updating`);
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
  remove(id: string) {
    logger.debug(`AdminService remove ${JSON.stringify({ id })}`);
    return this.findById(id).then(async (admin: Admin | null) => {
      if (admin) {
        logger.debug(`AdminService remove ${JSON.stringify({ id })}`);
        return admin.destroy();
      } else {
        logger.error(`No admin found with ID ${id} when deleting`);
        throw new Error(`No admin found with ID ${id} when deleting`);
      }
    });
  }
}

export default new AdminService();
