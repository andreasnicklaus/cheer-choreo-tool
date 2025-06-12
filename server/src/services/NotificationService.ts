import NotificationModel from "../db/models/notification";
import User from "../db/models/user";

const { Op } = require("sequelize");
const { logger } = require("../plugins/winston");
const roundToDecimals = require("../utils/numbers");
const UserService = require("./UserService");
const Position = require("../db/models/position");

/**
 * Service for managing notifications.
 * Handles notification creation, delivery, and management.
 *
 * @class NotificationService
 */
class NotificationService {
  /**
   * Get all notifications for a user.
   * @param {string} UserId - The user's UUID.
   * @param {Object} options - Options for fetching notifications.
   * @param {boolean} options.all - Whether to fetch all notifications.
   * @returns {Promise<Array>} List of notifications.
   */
  getAll(UserId: string | null, options = { all: false }) {
    logger.debug(`NotificationService.getAll ${JSON.stringify({ UserId, options })}`)
    return NotificationModel.findAll({
      where: options.all || !UserId ? {} : { UserId },
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Find a notification by ID.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object|null>} The notification object or null.
   */
  findById(id: string, UserId: string) {
    logger.debug(`NotificationService.findById ${JSON.stringify({ id, UserId })}`)
    return Position.findOne({ where: { id, UserId } });
  }

  /**
   * Create notifications for all users.
   * @param {string} title - Notification title.
   * @param {string} message - Notification message.
   * @returns {Promise<Array>} List of created notifications.
   */
  createForAll(title: string, message: string) {
    logger.debug(`NotificationService.createForAll ${JSON.stringify({ title, message })}`)
    return UserService.getAll().then((users: User[]) => {
      return Promise.all(
        users.map((user) => this.createOne(title, message, user.id))
      );
    });
  }

  /**
   * Create a notification for a single user.
   * @param {string} title - Notification title.
   * @param {string} message - Notification message.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object>} The created notification object.
   */
  createOne(title: string, message: string, UserId: string) {
    logger.debug(`NotificationService.createOne ${JSON.stringify({ title, message, UserId })}`)
    return NotificationModel.create({
      title,
      message,
      UserId,
    });
  }

  /**
   * Find or create a notification.
   * @param {string} title - Notification title.
   * @param {string} message - Notification message.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object>} The notification object.
   */
  async findOrCreate(title: string, message: string, UserId: string) {
    logger.debug(`NotificationService.findOrCreate ${JSON.stringify({ title, message, UserId })}`)
    const [notification, _created] = await NotificationModel.findOrCreate({
      where: {
        title,
        message,
        UserId,
      },
    });
    return notification;
  }

  /**
   * Mark a notification as read.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object>} The updated notification object.
   */
  markRead(id: string, UserId: string) {
    logger.debug(`NotificationService.markRead ${JSON.stringify({ id, UserId })}`)
    return this.update(id, UserId, { read: true });
  }

  /**
   * Mark a notification as unread.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object>} The updated notification object.
   */
  markUnread(id: string, UserId: string) {
    logger.debug(`NotificationService.markUnread ${JSON.stringify({ id, UserId })}`)
    return this.update(id, UserId, { read: false });
  }

  /**
   * Update a notification.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @param {Object} data - Data to update.
   * @returns {Promise<Object>} The updated notification object.
   */
  update(id: string, UserId: string, data: object) {
    logger.debug(
      `NotificationService.update ${JSON.stringify({
        id,
        data,
        UserId,
      })}`
    );
    return NotificationModel.findOne({
      where: { id, UserId },
    }).then(async (foundNotification) => {
      if (foundNotification) {
        await foundNotification.update(data);
        return foundNotification.save();
      } else {
        logger.error(
          `No notification found with ID ${id} when updating`
        );
        throw new Error(
          `No notification found with ID ${id} when updating`
        );
      }
    });
  }

  /**
   * Remove a notification.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @param {Object} options - Options for removing notifications.
   * @param {boolean} options.all - Whether to remove all notifications.
   * @returns {Promise<void>} Resolves if notification removed.
   */
  remove(id: string, UserId: string | null, options = { all: false }) {
    logger.debug(
      `NotificationService.remove ${JSON.stringify({ id, UserId })}`
    );
    return NotificationModel.findOne({
      where: options.all || !UserId ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundNotification) => {
        if (foundNotification) {
          return foundNotification.destroy();
        } else {
          logger.error(
            `No notification found with ID ${id} when deleting`
          );
          throw new Error(
            `No notification found with ID ${id} when deleting`
          );
        }
      });
  }

  /**
   * Get the percentage of read notifications.
   * @returns {Promise<number>} The percentage of read notifications.
   */
  getReadPercentage() {
    logger.debug(`NotificationService.getReadPercentage`)
    return Promise.all([
      NotificationModel.count({
        where: {
          read: true,
          createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      NotificationModel.count({
        where: {
          createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(([readNoticationsCount, allNoticiationsCount]) => {
      if (allNoticiationsCount == 0) return 100;
      return roundToDecimals(
        (readNoticationsCount / allNoticiationsCount) * 100,
        1
      );
    });
  }

  /**
   * Get the trend of read notifications.
   * @returns {Promise<number>} The trend percentage of read notifications.
   */
  getReadTrend() {
    logger.debug(`NotificationService.getReadTrend`)
    return Promise.all([
      NotificationModel.count({
        where: {
          read: true,
          createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      NotificationModel.count({
        where: {
          createdAt: { [Op.gt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      NotificationModel.count({
        where: {
          read: true,
          createdAt: { [Op.lt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      NotificationModel.count({
        where: {
          createdAt: { [Op.lt]: new Date().valueOf() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
    ]).then(
      ([
        readNoticationsCountLastMonth,
        allNoticiationsCountLastMonth,
        readNoticationsCountBeforeLastMonth,
        allNoticationsCountBeforeLastMonth,
      ]) => {
        if (
          allNoticationsCountBeforeLastMonth == 0 ||
          allNoticiationsCountLastMonth ||
          0
        )
          return 0;
        return roundToDecimals(
          (readNoticationsCountBeforeLastMonth /
            allNoticationsCountBeforeLastMonth -
            readNoticationsCountLastMonth / allNoticiationsCountLastMonth) *
          100,
          1
        );
      }
    );
  }
}

export default new NotificationService();
