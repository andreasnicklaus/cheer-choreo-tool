const { Router } = require("express");
const NotificationService = require("../../services/NotificationService");
const UserService = require("../../services/UserService");
const MailService = require("../../services/MailService");
const AuthService = require("../../services/AuthService");

const router = Router();

router.get("/", (req, res, next) => {
  return Promise.all([
    NotificationService.getAll(null, { all: true }),
    UserService.getAll(),
  ])
    .then(([notificationList, userList]) => {
      return res.render("../src/views/admin/notifications.ejs", {
        username: req.Admin.username,
        notificationList,
        userList,
      }); // njsscan-ignore: express_lfr_warning
    })
    .catch((e) => next(e));
});

router.post("/", (req, res, next) => {
  let { title, message, notifyViaEmail, sendToAllUsers, targetUsers } =
    req.body;

  if (typeof targetUsers == "string") targetUsers = [targetUsers];

  let notificationSendPromise = null;
  if (sendToAllUsers)
    notificationSendPromise = NotificationService.createForAll(title, message);
  else {
    notificationSendPromise = Promise.all(
      targetUsers.map((userId) =>
        NotificationService.createOne(title, message, userId)
      )
    );
  }

  return notificationSendPromise.then(async () => {
    if (notifyViaEmail) {
      if (sendToAllUsers) {
        await UserService.getAll().then((users) => {
          targetUsers = users.map((u) => u.id);
        });
      }
      Promise.all(
        targetUsers.map((userId) => {
          return UserService.findById(userId).then((user) => {
            if (user.email && user.emailConfirmed) {
              const token = AuthService.generateAccessToken(user.id, {
                expiresIn: process.env.SSO_TOKEN_EXPIRES_IN,
              });
              return MailService.sendNotificationNotice(
                user.email,
                user.username,
                token,
                title
              );
            }
          });
        })
      );
    }

    res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    return next();
  });
});

// router.post("/update", (req, res, next) => {
//   let { id, ...data } = req.body;
//   data.emailConfirmed = data.emailConfirmed === "on";
//   if (data.email == "") data.email = undefined;
//   if (data.password == "") data.password = undefined;
//   return UserService.update(id, data)
//     .then(() => {
//       return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
//     })
//     .catch((e) => next(e));
// });

router.delete("/:id", (req, res, next) => {
  return NotificationService.remove(req.params.id, null, { all: true })
    .then(() => {
      res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { notificationRouter: router };
