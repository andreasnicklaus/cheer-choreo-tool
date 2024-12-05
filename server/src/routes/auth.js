const { Router } = require("express");
const UserService = require("../services/UserService");
const AuthService = require("../services/AuthService");
const bcrypt = require("bcrypt");
const { ValidationError, UniqueConstraintError } = require("sequelize");

const router = Router();

router.post("/", (req, res, next) => {
  const { username, password, email } = req.body;
  UserService.create(username, password, email)
    .then((user) => {
      res.send();
      next();
    })
    .catch((e) => {
      if (e instanceof UniqueConstraintError) {
        res
          .status(400)
          .send(
            Object.keys(e.fields).includes("username") ||
              Object.keys(e.fields).includes("email")
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
  UserService.findByUsernameOrEmail(username, { scope: "withPasswordHash" })
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password))
        return res.status(404).send();

      if (user.email && !user.emailConfirmed)
        return res.status(400).send({
          type: "EmailUnconfirmed",
          message:
            "Du musst dein E-Mail-Adresse bestätigen, um dein Konto zu aktivieren",
        });
      const token = AuthService.generateAccessToken(user.id);
      res.send(token);
      next();
    })
    .catch((e) => next(e));
});

router.get("/me", AuthService.authenticateUser(), (req, res, next) => {
  UserService.findById(req.UserId)
    .then((user) => {
      res.send(user);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { authRouter: router };
