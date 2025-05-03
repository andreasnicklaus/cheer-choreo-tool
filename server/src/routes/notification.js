const { Router } = require("express");
const NotificationService = require("../services/NotificationService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/", authenticateUser(), (req, res, next) => {
  NotificationService.getAll(req.UserId)
    .then((choreoList) => {
      res.send(choreoList);
      return next();
    })
    .catch((e) => next(e));
});

router.post("/:id/read", authenticateUser(), (req, res, next) => {
  return NotificationService.markRead(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});
router.post("/:id/unread", authenticateUser(), (req, res, next) => {
  return NotificationService.markUnread(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser(), (req, res, next) => {
  return NotificationService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { notificationRouter: router };
