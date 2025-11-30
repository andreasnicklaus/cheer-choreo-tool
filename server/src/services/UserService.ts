import { NotFoundError } from "@/utils/errors";
import User from "../db/models/user";

const { Op } = require("sequelize");
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
    logger.debug(`UserService getAll`);
    return User.findAll();
  }

  /**
   * Get a user by ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<Object>} The user object.
   */
  async findById(id: string) {
    logger.debug(`UserService findById ${JSON.stringify({ id })}`);
    return User.findByPk(id, { include: ["Clubs"] });
  }

  /**
   * Find a user by username or email.
   * @param {string} usernameOrEmail - The username or email of the user.
   * @param {Object} options - Additional options.
   * @param {string} [options.scope="defaultScope"] - Scope for the query.
   * @returns {User} The user object.
   */
  async findByUsernameOrEmail(
    usernameOrEmail: string,
    { scope = "defaultScope" } = {},
  ) {
    logger.debug(
      `UserService findByUsernameOrEmail ${JSON.stringify({
        usernameOrEmail,
        scope,
      })}`,
    );
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
    logger.debug(`UserService getCount`);
    return User.count();
  }

  /**
   * Get the trend of user creation and deletion.
   * @returns {Promise<number>} The trend value.
   */
  getTrend() {
    logger.debug(`UserService getTrend`);
    return Promise.all([
      User.count({
        where: {
          createdAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
        },
      }),
      User.count({
        where: {
          deletedAt: {
            [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30,
          },
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
  async create(
    username: string,
    password: string,
    email: string,
    emailConfirmed: boolean,
    locale: string,
  ) {
    logger.debug(
      `UserService create ${JSON.stringify({
        username,
        password: password ? "<redacted>" : "undefined",
        email,
        emailConfirmed,
        locale,
      })}`,
    );
    return User.create({ username, password, email, emailConfirmed }).then(
      (user) => {
        MailService.sendUserRegistrationNotice(
          user.username,
          user.id,
          user.email,
        ).catch(logger.error);
        NotificationService.createOne(
          i18n.__({ phrase: "notifications.welcome.title", locale }),
          i18n.__({ phrase: "notifications.welcome.message", locale }),
          user.id,
        );

        if (email) {
          MailService.sendEmailConfirmationEmail(
            user.username,
            user.id,
            user.email,
            locale,
          ).catch(logger.error);
          MailService.sendWelcomeEmail(
            user.username,
            user.id,
            user.email,
            locale,
          ).catch(logger.error);
        }
        return user;
      },
    );
  }

  /**
   * Find or create a user.
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} The user object.
   */
  async findOrCreate(username: string, password: string) {
    logger.debug(
      `UserService findOrCreate ${JSON.stringify({ username, password })}`,
    );
    const [user, _created] = await User.findOrCreate({
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
  async update(id: string, data: Record<string, unknown>) {
    const { password, ...logData } = data;
    logger.debug(`UserService update ${JSON.stringify({ id, data: logData })}`);
    return User.findByPk(id).then(async (foundUser) => {
      if (foundUser) {
        await foundUser.update(data);
        await foundUser.save();
        return User.findByPk(id);
      } else {
        logger.error(`No user found with ID ${id} when updating`);
        throw new NotFoundError(`No user found with ID ${id} when updating`);
      }
    });
  }

  /**
   * Remove a user.
   * @param {string} id - The ID of the user.
   * @returns {Promise<void>} Resolves when the user is removed.
   */
  async remove(id: string) {
    logger.debug(`UserService remove ${JSON.stringify({ id })}`);
    return User.findByPk(id).then((foundUser) => {
      if (foundUser) {
        return foundUser.destroy();
      } else {
        logger.error(`No user found with ID ${id} when deleting`);
        throw new NotFoundError(`No user found with ID ${id} when deleting`);
      }
    });
  }

  /**
   * Get the percentage of logged-in users.
   * @returns {Promise<number>} The percentage of logged-in users.
   */
  getLoggedInPercentage() {
    logger.debug(`UserService getLoggedInPercentage`);
    return Promise.all([
      this.getCount(),
      User.count({
        where: {
          lastLoggedIn: { [Op.is]: null },
        },
      }),
    ]).then(([totalCount, notLoggedInCount]) => {
      return roundToDecimals(
        ((totalCount - notLoggedInCount) / totalCount) * 100,
        1,
      );
    });
  }
}

export default new UserService();
