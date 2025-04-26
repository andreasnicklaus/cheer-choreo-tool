const { Op } = require("sequelize");
const Notification = require("../db/models/notification");
const { logger } = require("../plugins/winston");
const roundToDecimals = require("../utils/numbers");
const UserService = require("./UserService");

class NotificationService {
  getAll(UserId, options = { all: false }) {
    return Notification.findAll({
      where: options.all ? {} : { UserId },
      order: [["createdAt", "DESC"]],
    });
  }

  findById(id, UserId) {
    return Position.findOne({ where: { id, UserId } });
  }

  createForAll(title, message) {
    return UserService.getAll().then((users) => {
      return Promise.all(
        users.map((user) => this.createOne(title, message, user.id))
      );
    });
  }

  createOne(title, message, UserId) {
    return Notification.create({
      title,
      message,
      UserId,
    });
  }

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

  markRead(id, UserId) {
    return this.update(id, UserId, { read: true });
  }

  markUnread(id, UserId) {
    return this.update(id, UserId, { read: true });
  }

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

  remove(id, UserId, options = { all: false }) {
    return Notification.findOne({
      where: options.all ? { id } : { id, UserId },
    }).then((foundNotification) => {
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
      return roundToDecimals(
        (readNoticationsCount / allNoticiationsCount) * 100,
        1
      );
    });
  }

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
