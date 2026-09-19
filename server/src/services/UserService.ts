import { NotFoundError } from "@/utils/errors";
import User from "../db/models/user";
import MailService from "./MailService";
import NotificationService from "./NotificationService";
import FeatureFlagService, { FeatureFlagKey } from "./FeatureFlagService";
import { AuthProvider } from "@/plugins/passport";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");
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
   * @param options - Options for the query.
   * @param options.includeDeleted - Whether to include soft-deleted users. Defaults to false.
   * @returns {Promise<Array>} Array of user objects.
   */
  async getAll(options: { includeDeleted?: boolean } = {}) {
    logger.debug(`UserService getAll ${JSON.stringify({ options })}`);
    if (options.includeDeleted) {
      return User.scope("includingDeleted").findAll();
    }
    return User.findAll();
  }

  /**
   * Find a deleted user by username or email.
   * @param {string | string[]} identifiers - The username, email, or array of identifiers to search for.
   * @returns {Promise<User | null>} The deleted user object or null if not found.
   */
  async findDeletedByUsernameOrEmail(identifiers: string | string[]) {
    const user = await this.findByUsernameOrEmail(identifiers, {
      scope: ["withPasswordHash", "includingDeleted"],
    });
    return user?.deletedAt ? user : null;
  }

  /**
   * Get a user by ID.
   * @param {UUID} id - The user's ID.
   * @returns {Promise<Object>} The user object.
   */
  async findById(id: string) {
    logger.debug(`UserService findById ${JSON.stringify({ id })}`);

    const accessSharingEnabled = await FeatureFlagService.isEnabled(
      FeatureFlagKey.ACCESS_SHARING,
    );

    if (!accessSharingEnabled) {
      const user = await User.findByPk(id, { include: ["Clubs"] });
      if (user) {
        user.childAccess = [];
        user.ownerAccess = [];
      }
      return user;
    }

    return User.findByPk(id, {
      include: [
        "Clubs",
        {
          association: "childAccess",
          include: ["owner"],
        },
        {
          association: "ownerAccess",
          include: ["child"],
        },
      ],
    });
  }

  /**
   * Find a user by username or email.
   * @param {string | string[]} identifier - The username, email, or array of identifiers to search for.
   * @param {Object} options - Additional options.
   * @param {string | string[]} [options.scope="defaultScope"] - Scope for the query.
   * @returns {User} The user object.
   */
  async findByUsernameOrEmail(
    identifier: string | string[],
    { scope = "defaultScope" }: { scope?: string | string[] } = {},
  ) {
    const identifiers = Array.isArray(identifier) ? identifier : [identifier];
    logger.debug(
      `UserService findByUsernameOrEmail ${JSON.stringify({
        identifiers,
        scope,
      })}`,
    );
    const conditions = identifiers.flatMap((id) => [
      { username: id },
      { email: id },
    ]);
    return User.scope(scope).findOne({
      where: { [Op.or]: conditions },
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
          email,
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
            email,
            locale,
          ).catch(logger.error);
          MailService.sendWelcomeEmail(
            user.username,
            user.id,
            email,
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
   * @returns {Promise<Array<Object|boolean>>} The user object and a boolean indicating if the user was created.
   */
  async findOrCreate(
    username: string,
    password: string,
  ): Promise<[User, boolean]> {
    logger.debug(
      `UserService findOrCreate ${JSON.stringify({ username, password })}`,
    );
    const [user, created] = await User.findOrCreate({
      where: { username },
      defaults: {
        username,
        password,
      },
    });
    return [user, created];
  }

  /**
   * Generate a username candidate for a social login user.
   *
   * @param provider - The provider used for social login.
   * @param displayName - The display name returned by the provider.
   * @returns A sanitized username suitable for creation.
   */
  generateSocialUsername(
    provider: AuthProvider,
    displayName: string | null,
  ): string {
    logger.debug(
      `UserService generateSocialUsername provider=${provider} displayName=${displayName}`,
    );

    const base = displayName
      ? displayName.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40)
      : `${provider}_${Math.random().toString(36).slice(2, 10)}`;
    const padded =
      base.length < 6 ? `${base}${"0".repeat(6 - base.length)}` : base;
    return padded;
  }

  /**
   * Find an existing social user or create a new one from OAuth profile data.
   *
   * @param provider - The provider used for social login.
   * @param socialId - The unique provider identifier for the user.
   * @param email - The email address returned by the provider.
   * @param displayName - The display name returned by the provider.
   * @returns The existing or newly created user.
   */
  async findOrCreateSocialUser(
    provider: AuthProvider,
    socialId: string,
    email: string | undefined | null,
    displayName: string | null,
    locale: string = "en",
  ): Promise<User> {
    logger.debug(
      `UserService findOrCreateSocialUser provider=${provider} socialId=${socialId} email=${email} displayName=${displayName}`,
    );

    const existing = await User.findOne({ where: { provider, socialId } });
    if (existing) {
      logger.debug(
        `Existing social user found provider=${provider} socialId=${socialId}`,
      );
      await existing.update({ lastLoggedIn: new Date() });
      return existing;
    }

    const baseUsername = this.generateSocialUsername(provider, displayName);
    let username = baseUsername;
    while (await User.findOne({ where: { username } })) {
      const suffix = Math.floor(Math.random() * 9999) + 1;
      username = `${baseUsername}-${suffix}`;
    }

    if (!email) {
      logger.warn(
        `Social user registration without email for provider=${provider} socialId=${socialId}`,
      );
    }

    try {
      const user = await User.create({
        username,
        email: email ?? undefined,
        provider,
        socialId,
        password: undefined,
        emailConfirmed: true,
      });
      logger.debug(
        `Created social user provider=${provider} socialId=${socialId} username=${username}`,
      );

      MailService.sendUserRegistrationNotice(
        user.username,
        user.id,
        email ?? "",
      ).catch(logger.error);
      NotificationService.createOne(
        i18n.__({ phrase: "notifications.welcome.title", locale }),
        i18n.__({ phrase: "notifications.welcome.message", locale }),
        user.id,
      );

      if (email) {
        MailService.sendWelcomeEmail(
          user.username,
          user.id,
          email,
          locale,
        ).catch(logger.error);
      }

      return user;
    } catch (error) {
      logger.error(
        `Failed to create social user provider=${provider} socialId=${socialId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  /**
   * Update a user.
   * @param {UUID} id - The ID of the user.
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
   * @param {UUID} id - The ID of the user.
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
   * Restore a soft-deleted user.
   * @param {UUID} id - The ID of the user.
   * @returns {Promise<void>} Resolves when the user is restored.
   */
  async restore(id: string) {
    logger.debug(`UserService restore ${JSON.stringify({ id })}`);
    return User.scope("includingDeleted")
      .findByPk(id)
      .then((foundUser) => {
        if (foundUser) {
          if (foundUser.deletedAt) {
            return foundUser.restore();
          }
          logger.warn(`User with ID ${id} is not deleted`);
          return;
        } else {
          logger.error(`No user found with ID ${id} when restoring`);
          throw new NotFoundError(`No user found with ID ${id} when restoring`);
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
