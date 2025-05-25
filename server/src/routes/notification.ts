import { NextFunction, Response, Request, Router } from "express";
import NotificationModel from "../db/models/notification";
import NotificationService from "../services/NotificationService";

const { default: AuthService } = require("../services/AuthService");

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
router.get("/", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  NotificationService.getAll(req.UserId)
    .then((notificationList: NotificationModel[]) => {
      res.send(notificationList);
      return next();
    })
    .catch((e: Error) => next(e));
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
router.post("/:id/read", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  return NotificationService.markRead(req.params.id, req.UserId)
    .then((notification: NotificationModel) => {
      res.send(notification);
      return next();
    })
    .catch((e: Error) => next(e));
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
router.post("/:id/unread", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  return NotificationService.markUnread(req.params.id, req.UserId)
    .then((notification: NotificationModel) => {
      res.send(notification);
      return next();
    })
    .catch((e: Error) => next(e));
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
router.delete("/:id", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  return NotificationService.remove(req.params.id, req.UserId)
    .then(() => {
      res.send();
      return next();
    })
    .catch((e: Error) => next(e));
});

export { router as notificationRouter };
