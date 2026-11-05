import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import AdminService from "../../services/AdminService";
import { validate } from "../../middlewares/validateMiddleware";
import { uuidParams } from "../../utils/zodSchemas";

const createAdminSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
const updateAdminSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1).optional(),
  password: z.string().optional(),
});

type CreateAdminBody = z.infer<typeof createAdminSchema>;
type UpdateAdminBody = z.infer<typeof updateAdminSchema>;
type UuidParams = z.infer<typeof uuidParams>;

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
    const limit = Math.max(
      parseInt(String(req.query.limit ?? "25"), 10) || 25,
      1,
    );
    const total = await AdminService.getCount();
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const adminList = await AdminService.getAll({ limit, offset });
    return res.render("../src/views/admin/admins.ejs", {
      username: req.Admin.username,
      adminList,
      currentAdmin: req.Admin,
      currentAdminId: req.AdminId,
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
  validate(createAdminSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body as CreateAdminBody;
    return AdminService.findOrCreate(username, password)
      .then(() => {
        return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      })
      .catch((e: Error) => next(e));
  },
);

router.post(
  "/update",
  validate(updateAdminSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { id, ...data } = req.body as UpdateAdminBody;
    if (data.password == "") data.password = undefined;
    return AdminService.update(id, data)
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
    return AdminService.remove(id)
      .then(() => {
        return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
      })
      .catch((e: Error) => next(e));
  },
);

export { router as adminsRouter };
