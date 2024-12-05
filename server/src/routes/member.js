const { Router } = require("express");
const MemberService = require("../services/MemberService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.post("/", authenticateUser(), (req, res, next) => {
  const { name, nickname, abbreviation, seasonTeamId } = req.body;
  MemberService.create(name, nickname, abbreviation, seasonTeamId, req.UserId)
    .then((member) => {
      res.send(member);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser(), (req, res, next) => {
  MemberService.update(req.params.id, req.body, req.UserId)
    .then((member) => {
      res.send(member);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser(), (req, res, next) => {
  MemberService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { memberRouter: router };
