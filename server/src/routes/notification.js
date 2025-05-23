const { Router } = require("express");
const NotificationService = require("../services/NotificationService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /notifications/:
 *   get:
 *     description: Get all notifications for the current user
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get("/", authenticateUser(), (req, res, next) => {
  NotificationService.getAll(req.UserId)
    .then((choreoList) => {
      res.send(choreoList);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /notifications/{id}/read:
 *   post:
 *     description: Mark a notification as read
 *     tags:
 *       - Notifications
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post("/:id/read", authenticateUser(), (req, res, next) => {
  return NotificationService.markRead(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /notifications/{id}/unread:
 *   post:
 *     description: Mark a notification as unread
 *     tags:
 *       - Notifications
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as unread
 */
router.post("/:id/unread", authenticateUser(), (req, res, next) => {
  return NotificationService.markUnread(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     description: Delete a notification by ID
 *     tags:
 *       - Notifications
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  return NotificationService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { notificationRouter: router };
