const { Router } = require("express");
const UserService = require("../../services/UserService");

const router = Router();

router.get("/", (req, res, next) => {
  return UserService.getAll()
    .then((userList) => {
      return res.render("../src/views/admin/users.ejs", {
        username: req.Admin.username,
        userList,
      });
    })
    .catch((e) => next(e));
});

router.post("/", (req, res, next) => {
  let { username, password, email, emailConfirmed } = req.body;
  if (email == "") email = null;
  return UserService.create(username, password, email, emailConfirmed)
    .then(() => {
      return res.redirect(req.baseUrl);
    })
    .catch((e) => next(e));
});

router.post("/update", (req, res, next) => {
  let { id, ...data } = req.body;
  data.emailConfirmed = data.emailConfirmed === "on";
  if (data.email == "") data.email = undefined;
  if (data.password == "") data.password = undefined;
  return UserService.update(id, data)
    .then(() => {
      return res.redirect(req.baseUrl);
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  return UserService.remove(req.params.id)
    .then(() => {
      return res.redirect(req.baseUrl);
    })
    .catch((e) => next(e));
});

module.exports = { userRouter: router };
