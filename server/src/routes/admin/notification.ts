import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import User from "../../db/models/user";
import NotificationService from "../../services/NotificationService";
import UserService from "../../services/UserService";
import AuthService from "../../services/AuthService";
import MailService from "../../services/MailService";
import { validate } from "../../middlewares/validateMiddleware";
import { uuidParams } from "../../utils/zodSchemas";

const sendNotificationSchema = z.object({
  title: z.string().optional(),
  message: z.string().min(1),
  targetUsers: z.union([z.string(), z.array(z.string())]).optional(),
  notifyViaEmail: z.string().optional(),
  sendToAllUsers: z.string().optional(),
});

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
    const limit = Math.max(
      parseInt(String(req.query.limit ?? "25"), 10) || 25,
      1,
    );
    const total = await NotificationService.getCount(null, { all: true });
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const [notificationList, userList] = await Promise.all([
      NotificationService.getAll(null, { all: true, limit, offset }),
      UserService.getAll(),
    ]);
    return res.render("../src/views/admin/notifications.ejs", {
      username: req.Admin.username,
      notificationList,
      userList,
      page: safePage,
      limit,
      total,
      totalPages,
    }); // njsscan-ignore: express_lfr_warning
  } catch (e) {
    return next(e as Error);
  }
});

router.post(
  "/",
  validate(sendNotificationSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { message, notifyViaEmail, sendToAllUsers } = req.body;
    let { title, targetUsers } = req.body;

    if (typeof targetUsers == "string") targetUsers = [targetUsers];
    if (!title || title.length == 0) title = null;

    let notificationSendPromise = null;
    if (sendToAllUsers)
      notificationSendPromise = NotificationService.createForAll(
        title,
        message,
      );
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
  },
);

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

router.delete(
  "/:id",
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    return NotificationService.remove(req.params.id, null, { all: true })
      .then(() => {
        res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as notificationRouter };
