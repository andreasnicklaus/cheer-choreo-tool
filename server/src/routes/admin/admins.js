const { Router } = require("express");
const AdminService = require("../../services/AdminService");

const router = Router();

router.get("/", (req, res, next) => {
  return AdminService.getAll()
    .then((adminList) => {
      return res.render("../src/views/admin/admins.ejs", {
        username: req.Admin.username,
        adminList,
        currentAdmin: req.Admin,
        currentAdminId: req.AdminId,
      }); // njsscan-ignore: express_lfr_warning
    })
    .catch((e) => next(e));
});

router.post("/", (req, res, next) => {
  const { username, password } = req.body;
  return AdminService.findOrCreate(username, password)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e) => next(e));
});

router.post("/update", (req, res, next) => {
  const { id, ...data } = req.body;
  if (data.password == "") data.password = undefined;
  return AdminService.update(id, data)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  return AdminService.remove(req.params.id)
    .then(() => {
      return res.redirect(req.baseUrl); // njsscan-ignore: express_open_redirect
    })
    .catch((e) => next(e));
});

module.exports = { adminRouter: router };
