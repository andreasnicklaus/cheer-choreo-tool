import { NextFunction, Request, Response, Router } from "express";
import Feedback from "../db/models/feedback";
import FeedbackService from "../services/FeedbackService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /feedback/:
 *   post:
 *     description: Submit feedback (optionally anonymous)
 *     tags:
 *       - Feedback
 *     security:
 *       - userAuthentication: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stars
 *               - text
 *             properties:
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(false),
  (req: Request, res: Response, next: NextFunction) => {
    const { stars, text } = req.body;
    const UserId = req.UserId;
    FeedbackService.create(stars, text, UserId)
      .then((feedback: Feedback) => {
        res.send(feedback);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /feedback/:
 *   get:
 *     description: Get all feedback for the current user
 *     tags:
 *       - Feedback
 *     security:
 *       - userAuthentication: []
 *     responses:
 *       200:
 *         description: List of feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/",
  AuthService.authenticateUser(false),
  (req: Request, res: Response, next: NextFunction) => {
    const UserId = req.UserId;
    if (!UserId) {
      res.send([]);
      return next();
    } else {
      FeedbackService.getAll(UserId)
        .then((feedbackList: Feedback[]) => {
          res.send(feedbackList);
          return next();
        })
        .catch((e: Error) => next(e));
    }
  },
);

export { router as feedbackRouter };
