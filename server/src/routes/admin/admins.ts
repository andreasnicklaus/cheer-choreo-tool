import { NextFunction, Request, Response, Router } from "express";
import Admin from "../../db/models/admin";
import AdminService from "../../services/AdminService";

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

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  return AdminService.findOrCreate(username, password)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

router.post("/update", (req: Request, res: Response, next: NextFunction) => {
  const { id, ...data } = req.body;
  if (data.password == "") data.password = undefined;
  return AdminService.update(id, data)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  return AdminService.remove(req.params.id)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e: Error) => next(e));
});

export { router as adminsRouter };
