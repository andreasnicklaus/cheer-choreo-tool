const { Router } = require("express");
const UserService = require("../services/UserService");
const AuthService = require("../services/AuthService");
const bcrypt = require("bcrypt");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const FileService = require("../services/FileService");
const path = require("node:path");
const MailService = require("../services/MailService");
const NotificationService = require("../services/NotificationService");

const router = Router();

router.post("/", (req, res, next) => {
  const { username, password, email } = req.body;
  UserService.create(username, password, email, false, req.locale)
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
            Object.keys(e.fields).includes("username") ||
              Object.keys(e.fields).includes("email")
              ? req.t("errors.user-already-exists")
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

      // if (user.email && !user.emailConfirmed)
      //   return res.status(400).send({
      //     type: "EmailUnconfirmed",
      //     message:
      //       "Du musst dein E-Mail-Adresse bestätigen, um dein Konto zu aktivieren",
      //   });
      const token = AuthService.generateAccessToken(user.id);
      res.send(token);
      next();
    })
    .catch((e) => next(e));
});

router.post("/ssoRequest", (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).send(req.t("responses.email-required"));

  AuthService.generateSsoToken(email, req.locale)
    .then(() => {
      res.send(req.t("responses.sso-link-sent"));
      next();
    })
    .catch((e) => next(e));
});

router.post("/sso", (req, res, next) => {
  const { ssoToken } = req.body;
  if (!ssoToken)
    return res.status(400).send(req.t("responses.sso-token-required"));

  AuthService.resolveSsoToken(ssoToken, req.locale)
    .then((user) => {
      const token = AuthService.generateAccessToken(user.id);
      res.send(token);
      next();
    })
    .catch((e) => {
      res.status(400).send(e.message);
      next();
    });
});

router.get("/me", AuthService.authenticateUser(), (req, res, next) => {
  UserService.findById(req.UserId)
    .then((user) => {
      res.send(user);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/me", AuthService.authenticateUser(), (req, res, next) => {
  const { username, email } = req.body;
  const data = { username, email };
  if (email && email != req.User.email) data.emailConfirmed = false;
  UserService.update(req.UserId, data)
    .then((user) => {
      if (email != req.User.email)
        return MailService.sendEmailConfirmationEmail(
          user.username,
          user.id,
          user.email,
          req.locale
        ).then(() => {
          res.send();
          return next();
        });
      res.send(user);
      return next();
    })
    .catch((e) => next(e));
});

router.put(
  "/me/profilePicture",
  AuthService.authenticateUser(),
  FileService.singleFileMiddleware("profilePicture"),
  (req, res, next) => {
    if (!req.file) res.status(400).send(req.t("responses.no-file-uploaded"));
    else {
      const profilePictureExtension = req.file.filename.split(".").pop();
      UserService.update(req.UserId, {
        profilePictureExtension,
      }).then((user) => {
        FileService.clearProfilePictureFolder(
          req.UserId,
          profilePictureExtension
        );
        res.send(user);
        return next();
      });
    }
  }
);

router.get(
  "/me/profilePicture/:filename",
  AuthService.authenticateUser(),
  (req, res, next) => {
    const { filename } = req.params;
    const root = path.join(__dirname, "../../uploads/profilePictures");

    if (filename.startsWith(req.UserId))
      return res.sendFile(filename, { root });

    return next();
  }
);

router.delete(
  "/me/profilePicture",
  AuthService.authenticateUser(),
  (req, res, next) => {
    UserService.update(req.UserId, { profilePictureExtension: null })
      .then(() => {
        FileService.clearProfilePictureFolder(req.UserId);
        res.send();
        return next();
      })
      .catch((e) => next(e));
  }
);

router.get(
  "/me/resendEmailConfirmationLink",
  AuthService.authenticateUser(),
  (req, res, next) => {
    UserService.findById(req.UserId)
      .then((user) => {
        return MailService.sendEmailConfirmationEmail(
          user.username,
          user.id,
          user.email,
          req.locale
        ).then(() => {
          NotificationService.createOne(
            req.t("notifications.confirm-email.title"),
            req.t("notifications.confirm-email.message"),
            user.id
          );
          res.send();
          return next();
        });
      })
      .catch((e) => next(e));
  }
);

module.exports = { authRouter: router };
