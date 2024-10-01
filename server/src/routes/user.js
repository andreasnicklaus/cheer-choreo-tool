const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const UserService = require("../services/UserService");

const router = Router();

router.put("/", authenticateUser, (req, res, next) => {
  UserService.update(req.UserId, req.body)
    .then((user) => {
      res.send(user);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/", authenticateUser, (req, res, next) => {
  UserService.remove(req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { userRouter: router };
