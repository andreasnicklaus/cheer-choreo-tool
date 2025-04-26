const Notification = require("../db/models/notification");
const { logger } = require("../plugins/winston");
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
}

module.exports = new NotificationService();
