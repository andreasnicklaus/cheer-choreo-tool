const { Op } = require("sequelize");
const User = require("../db/models/user");
const { logger } = require("../plugins/winston");
const MailService = require("./MailService");
const NotificationService = require("./NotificationService");
const i18n = require("i18n");
const roundToDecimals = require("../utils/numbers");

/**
 * Service for managing user entities and authentication.
 * Handles CRUD operations and user-specific logic.
 *
 * @class UserService
 */
class UserService {
  /**
   * Get all users.
   * @returns {Promise<Array>} Array of user objects.
   */
  async getAll() {
    return User.findAll();
  }

  /**
   * Get a user by ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<Object>} The user object.
   */
  async findById(id) {
    return User.findByPk(id, { include: ["Clubs"] });
  }

  /**
   * Find a user by username or email.
   * @param {string} usernameOrEmail - The username or email of the user.
   * @param {Object} options - Additional options.
   * @param {string} [options.scope="defaultScope"] - Scope for the query.
   * @returns {Promise<Object>} The user object.
   */
  async findByUsernameOrEmail(
    usernameOrEmail,
    { scope = "defaultScope" } = {}
  ) {
    return User.scope(scope).findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    }); // njsscan-ignore: node_nosqli_injection
  }

  /**
   * Get the total count of users.
   * @returns {Promise<number>} The total count of users.
   */
  getCount() {
    return User.count();
  }

  /**
   * Get the trend of user creation and deletion.
   * @returns {Promise<number>} The trend value.
   */
  getTrend() {
    return Promise.all([
      User.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      User.count({
        where: {
          deletedAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([created, deleted]) => created - deleted);
  }

  /**
   * Create a new user.
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @param {string} email - The email of the user.
   * @param {boolean} emailConfirmed - Whether the email is confirmed.
   * @param {string} locale - The locale for notifications.
   * @returns {Promise<Object>} The created user object.
   */
  async create(username, password, email, emailConfirmed, locale) {
    return User.create({ username, password, email, emailConfirmed }).then(
      (user) => {
        MailService.sendUserRegistrationNotice(
          user.username,
          user.id,
          user.email
        ).catch(logger.error);
        NotificationService.createOne(
          i18n.__({ phrase: "notifications.welcome.title", locale }),
          i18n.__({ phrase: "notifications.welcome.message", locale }),
          user.id
        );

        if (email) {
          MailService.sendEmailConfirmationEmail(
            user.username,
            user.id,
            user.email,
            locale
          ).catch(logger.error);
          MailService.sendWelcomeEmail(
            user.username,
            user.id,
            user.email,
            locale
          ).catch(logger.error);
        }
        return user;
      }
    );
  }

  /**
   * Find or create a user.
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} The user object.
   */
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

  /**
   * Update a user.
   * @param {string} id - The ID of the user.
   * @param {Object} data - The data to update.
   * @returns {Promise<Object>} The updated user object.
   */
  async update(id, data) {
    return User.findByPk(id).then(async (foundUser) => {
      if (foundUser) {
        logger.debug(`UserService.update ${JSON.stringify({ id, data })}`);
        await foundUser.update(data);
        await foundUser.save();
        return User.findByPk(id);
      } else
        throw Error(`Beim Update wurde kein User mit der ID ${id} gefunden`);
    });
  }

  /**
   * Remove a user.
   * @param {string} id - The ID of the user.
   * @returns {Promise<void>} Resolves when the user is removed.
   */
  async remove(id) {
    return User.findByPk(id).then((foundUser) => {
      if (foundUser) {
        logger.debug(`UserService.remove ${JSON.stringify({ id })}`);
        return foundUser.destroy();
      } else {
        throw Error(`Beim Löschen wurde kein User mit der ID ${id} gefunden`);
      }
    });
  }

  /**
   * Get the percentage of logged-in users.
   * @returns {Promise<number>} The percentage of logged-in users.
   */
  getLoggedInPercentage() {
    return Promise.all([
      this.getCount(),
      User.count({
        where: {
          lastLoggedIn: null,
        },
      }),
    ]).then(([totalCount, notLoggedInCount]) => {
      return roundToDecimals(
        ((totalCount - notLoggedInCount) / totalCount) * 100,
        1
      );
    });
  }
}

module.exports = new UserService();
