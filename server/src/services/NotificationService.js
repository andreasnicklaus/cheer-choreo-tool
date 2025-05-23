const { Op } = require("sequelize");
const Notification = require("../db/models/notification");
const { logger } = require("../plugins/winston");
const roundToDecimals = require("../utils/numbers");
const UserService = require("./UserService");

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
  getAll(UserId, options = { all: false }) {
    return Notification.findAll({
      where: options.all ? {} : { UserId },
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Find a notification by ID.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object|null>} The notification object or null.
   */
  findById(id, UserId) {
    return Position.findOne({ where: { id, UserId } });
  }

  /**
   * Create notifications for all users.
   * @param {string} title - Notification title.
   * @param {string} message - Notification message.
   * @returns {Promise<Array>} List of created notifications.
   */
  createForAll(title, message) {
    return UserService.getAll().then((users) => {
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
  createOne(title, message, UserId) {
    return Notification.create({
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
  async findOrCreate(title, message, UserId) {
    const [notification, created] = await Notification.findOrCreate({
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
  markRead(id, UserId) {
    return this.update(id, UserId, { read: true });
  }

  /**
   * Mark a notification as unread.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @returns {Promise<Object>} The updated notification object.
   */
  markUnread(id, UserId) {
    return this.update(id, UserId, { read: false });
  }

  /**
   * Update a notification.
   * @param {string} id - Notification ID.
   * @param {string} UserId - The user's UUID.
   * @param {Object} data - Data to update.
   * @returns {Promise<Object>} The updated notification object.
   */
  update(id, UserId, data) {
    return Notification.findOne({
      where: { id, UserId },
    }).then(async (foundNotification) => {
      if (foundNotification) {
        logger.debug(
          `NotificationService.update ${JSON.stringify({
            id,
            data,
            UserId,
          })}`
        );
        await foundNotification.update(data);
        return foundNotification.save();
      } else
        throw Error(
          `Beim Update wurde keine Notification mit der ID ${id} gefunden`
        );
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
  remove(id, UserId, options = { all: false }) {
    return Notification.findOne({
      where: options.all ? { id } : { id, UserId },
    }) // njsscan-ignore: node_nosqli_injection
      .then((foundNotification) => {
        if (foundNotification) {
          logger.debug(
            `NotificationService.remove ${JSON.stringify({ id, UserId })}`
          );
          return foundNotification.destroy();
        } else {
          throw Error(
            `Beim Löschen wurde keine Notification mit der ID ${id} gefunden`
          );
        }
      });
  }

  /**
   * Get the percentage of read notifications.
   * @returns {Promise<number>} The percentage of read notifications.
   */
  getReadPercentage() {
    return Promise.all([
      Notification.count({
        where: {
          read: true,
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Notification.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
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
    return Promise.all([
      Notification.count({
        where: {
          read: true,
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Notification.count({
        where: {
          createdAt: { [Op.gt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Notification.count({
        where: {
          read: true,
          createdAt: { [Op.lt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
        },
      }),
      Notification.count({
        where: {
          createdAt: { [Op.lt]: new Date() - 1000 * 60 * 60 * 24 * 30 },
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

module.exports = new NotificationService();
