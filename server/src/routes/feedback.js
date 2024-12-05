const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const FeedbackService = require("../services/FeedbackService");

const router = Router();

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
