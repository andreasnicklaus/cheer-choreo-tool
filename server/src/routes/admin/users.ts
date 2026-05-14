import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import User from "../../db/models/user";
import UserService from "../../services/UserService";
import { validate } from "../../middlewares/validateMiddleware";
import { uuidParams } from "../../utils/zodSchemas";

const createUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().optional(),
});
const updateUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1).optional(),
  password: z.string().optional(),
  email: z.string().optional(),
});
const recoverUserSchema = z.object({
  id: z.string().min(1),
});

type CreateUserBody = z.infer<typeof createUserSchema>;
type RecoverUserBody = z.infer<typeof recoverUserSchema>;
type UuidParams = z.infer<typeof uuidParams>;

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return UserService.getAll({ includeDeleted: true })
    .then((userList: User[]) => {
      return res.render("../src/views/admin/users.ejs", {
        username: req.Admin.username,
        userList,
      }); // njsscan-ignore: express_lfr_warning
    })
    .catch((e: Error) => next(e));
});

router.post("/", validate(createUserSchema), (req: Request, res: Response, next: NextFunction) => {
  const { username, password, email } = req.body as CreateUserBody;
  const emailConfirmed = req.body.emailConfirmed === "on";

  const cleanEmail = email === "" ? null : email;

  return UserService.create(
    username,
    password,
    cleanEmail as string,
    emailConfirmed,
    req.locale,
  )
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

router.post("/update", validate(updateUserSchema), (req: Request, res: Response, next: NextFunction) => {
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

router.delete("/:id", validate(uuidParams, "params"), (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as UuidParams;
  return UserService.remove(id)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

router.post("/recover", validate(recoverUserSchema), (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body as RecoverUserBody;
  return UserService.restore(id)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

export { router as userRouter };
