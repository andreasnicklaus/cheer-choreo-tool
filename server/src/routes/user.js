const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const UserService = require("../services/UserService");
let ejs = require("ejs");

const router = Router();

router.put("/", authenticateUser(), (req, res, next) => {
  UserService.update(req.UserId, req.body)
    .then((user) => {
      res.send(user);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/", authenticateUser(), (req, res, next) => {
  UserService.remove(req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

router.get("/revokeEmail/:id", (req, res, next) => {
  UserService.remove(req.params.id)
    .then((result) => {
      ejs
        .renderFile("src/views/emailRevoked.ejs", {
          frontendDomain: process.env.FRONTEND_DOMAIN,
        })
        .then((html) => {
          res.send(html);
          next();
        });
    })
    .catch((e) => {
      ejs
        .renderFile("src/views/error.ejs", {
          action: "email-revocation",
          data: JSON.stringify({ userId: req.params.id }),
          error: e,
          timestamp: new Date().toLocaleString("de"),
          emailBody: encodeURIComponent(`Hallo,

            ich möchte einen Fehler melden:
  
            Action: email-confirmation
            Data: ${JSON.stringify({ userId: req.params.id })}
            Fehlermeldung: ${e}
            Timestamp: ${new Date().toLocaleString("de")}
  
            Vielen Dank!
            `),
        })
        .then((html) => {
          res.send(html);
          // next(e);
        });
    });
});

router.get("/confirmEmail/:id", (req, res, next) => {
  UserService.update(req.params.id, { emailConfirmed: true })
    .then((result) => {
      ejs
        .renderFile("src/views/emailConfirmed.ejs", {
          frontendDomain: process.env.FRONTEND_DOMAIN,
        })
        .then((html) => {
          res.send(html);
          next();
        });
    })
    .catch((e) => {
      ejs
        .renderFile("src/views/error.ejs", {
          action: "email-confirmation",
          data: JSON.stringify({ userId: req.params.id }),
          error: e,
          timestamp: new Date().toLocaleString("de"),
          emailBody: encodeURIComponent(`Hallo,

          ich möchte einen Fehler melden:

          Action: email-confirmation
          Data: ${JSON.stringify({ userId: req.params.id })}
          Fehlermeldung: ${e}
          Timestamp: ${new Date().toLocaleString("de")}

          Vielen Dank!
          `),
        })
        .then((html) => {
          res.send(html);
          // next(e);
        });
    });
});

module.exports = { userRouter: router };
