const { Router } = require("express");
const UserService = require("../services/UserService");
const AuthService = require("../services/AuthService");
const bcrypt = require("bcrypt");
const { ValidationError, UniqueConstraintError } = require("sequelize");

const router = Router();

router.post("/", (req, res, next) => {
  const { username, password } = req.body;
  UserService.create(username, password)
    .then((user) => {
      const token = AuthService.generateAccessToken(user.id);
      res.send(token);
      next();
    })
    .catch((e) => {
      if (e instanceof UniqueConstraintError) {
        res
          .status(400)
          .send(
            Object.keys(e.fields).includes("username")
              ? "Nutzer existiert bereits"
              : null
          );
        return next();
      } else if (e instanceof ValidationError) {
        res.status(400).send(e.errors[0].message);
        return next();
      }
      next(e);
    });
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  UserService.findByUsername(username, { scope: "withPasswordHash" })
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password))
        return res.status(404).send();
      const token = AuthService.generateAccessToken(user.id);
      res.send(token);
      next();
    })
    .catch((e) => next(e));
});

router.get("/me", AuthService.authenticateUser, (req, res, next) => {
  UserService.findById(req.UserId)
    .then((user) => {
      res.send(user);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { authRouter: router };