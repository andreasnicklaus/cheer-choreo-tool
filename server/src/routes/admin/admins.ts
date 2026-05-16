import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import Admin from "../../db/models/admin";
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

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return AdminService.getAll()
    .then((adminList: Admin[]) => {
      return res.render("../src/views/admin/admins.ejs", {
        username: req.Admin.username,
        adminList,
        currentAdmin: req.Admin,
        currentAdminId: req.AdminId,
      }); // njsscan-ignore: express_lfr_warning
    })
    .catch((e: Error) => next(e));
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
