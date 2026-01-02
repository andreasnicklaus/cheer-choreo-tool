import { NextFunction, Request, Response, Router } from "express";
import User from "../../db/models/user";
import NotificationService from "../../services/NotificationService";
import UserService from "../../services/UserService";
import AuthService from "../../services/AuthService";
import MailService from "../../services/MailService";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
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

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { message, notifyViaEmail, sendToAllUsers } = req.body;
  let { title, targetUsers } = req.body;

  if (typeof targetUsers == "string") targetUsers = [targetUsers];
  if (!title || title.length == 0) title = null;

  let notificationSendPromise = null;
  if (sendToAllUsers)
    notificationSendPromise = NotificationService.createForAll(title, message);
  else {
    notificationSendPromise = Promise.all(
      targetUsers.map((userId: string) =>
        NotificationService.createOne(title, message, userId),
      ),
    );
  }

  return notificationSendPromise
    .then(async () => {
      if (notifyViaEmail) {
        if (sendToAllUsers) {
          await UserService.getAll().then((users: User[]) => {
            targetUsers = users.map((u) => u.id);
          });
        }
        Promise.all(
          targetUsers.map((userId: string) => {
            return UserService.findById(userId).then((user: User | null) => {
              if (user?.email && user.emailConfirmed) {
                const token = AuthService.generateAccessToken(user.id, {
                  expiresIn: process.env.SSO_TOKEN_EXPIRES_IN,
                });
                return MailService.sendNotificationNotice(
                  user.email,
                  user.username,
                  token,
                  title,
                  req.locale,
                );
              }
            });
          }),
        );
      }

      res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      return next();
    })
    .catch((e: Error) => next(e));
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

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  return NotificationService.remove(req.params.id, null, { all: true })
    .then(() => {
      res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      return next();
    })
    .catch((e: Error) => next(e));
});

export { router as notificationRouter };
