import { NextFunction, Request, Response, Router } from "express";
import User from "../../db/models/user";
import UserService from "../../services/UserService";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return UserService.getAll()
    .then((userList: User[]) => {
      return res.render("../src/views/admin/users.ejs", {
        username: req.Admin.username,
        userList,
      }); // njsscan-ignore: express_lfr_warning
    })
    .catch((e: Error) => next(e));
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { username, password, emailConfirmed } = req.body;

  let { email } = req.body.email;
  if (email == "") email = null;

  return UserService.create(
    username,
    password,
    email,
    emailConfirmed,
    req.locale,
  )
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

router.post("/update", (req: Request, res: Response, next: NextFunction) => {
  const { id, ...data } = req.body;
  data.emailConfirmed = data.emailConfirmed === "on";
  if (data.email == "") data.email = undefined;
  if (data.password == "") data.password = undefined;
  return UserService.update(id, data)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  return UserService.remove(req.params.id)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

export { router as userRouter };
