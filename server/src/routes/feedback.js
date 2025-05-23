const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const FeedbackService = require("../services/FeedbackService");

const router = Router();

/**
 * @openapi
 * /feedback/:
 *   post:
 *     description: Submit feedback (optionally anonymous)
 *     tags:
 *       - Feedback
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
 */
router.post("/", authenticateUser(false), (req, res, next) => {
  const { stars, text } = req.body;
  const UserId = req.UserId;
  FeedbackService.create(stars, text, UserId || null)
    .then((feedback) => {
      res.send(feedback);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /feedback/:
 *   get:
 *     description: Get all feedback for the current user
 *     tags:
 *       - Feedback
 *     responses:
 *       200:
 *         description: List of feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 */
router.get("/", authenticateUser(false), (req, res, next) => {
  const UserId = req.UserId;
  if (!UserId) {
    res.send([]);
    return next();
  } else {
    FeedbackService.getAll(UserId)
      .then((feedbackList) => {
        res.send(feedbackList);
        return next();
      })
      .catch((e) => next(e));
  }
});

module.exports = { feedbackRouter: router };
