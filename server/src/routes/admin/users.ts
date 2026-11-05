import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
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
  emailConfirmed: z.string().optional(),
  provider: z.string().optional(),
  socialId: z.string().optional(),
  profilePictureExtension: z.string().optional(),
});
const recoverUserSchema = z.object({
  id: z.string().min(1),
});

type CreateUserBody = z.infer<typeof createUserSchema>;
type RecoverUserBody = z.infer<typeof recoverUserSchema>;
type UuidParams = z.infer<typeof uuidParams>;

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
    const limit = Math.max(
      parseInt(String(req.query.limit ?? "25"), 10) || 25,
      1,
    );
    const total = await UserService.getCount({ includeDeleted: true });
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const userList = await UserService.getAll({
      includeDeleted: true,
      limit,
      offset,
    });
    return res.render("../src/views/admin/users.ejs", {
      username: req.Admin.username,
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
  validate(createUserSchema),
  (req: Request, res: Response, next: NextFunction) => {
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
  },
);

router.post(
  "/update",
  validate(updateUserSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { id, ...data } = req.body;
    data.emailConfirmed = data.emailConfirmed === "on";
    if (data.email == "") data.email = undefined;
    if (data.password == "") data.password = undefined;
    if (data.provider == "") data.provider = undefined;
    if (data.socialId == "") data.socialId = undefined;
    if (data.profilePictureExtension == "")
      data.profilePictureExtension = undefined;
    return UserService.update(id, data)
      .then(() => {
        return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      })
      .catch((e: Error) => next(e));
  },
);

router.delete(
  "/:id",
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as UuidParams;
    return UserService.remove(id)
      .then(() => {
        return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      })
      .catch((e: Error) => next(e));
  },
);

router.post(
  "/recover",
  validate(recoverUserSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body as RecoverUserBody;
    return UserService.restore(id)
      .then(() => {
        return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      })
      .catch((e: Error) => next(e));
  },
);

export { router as userRouter };
