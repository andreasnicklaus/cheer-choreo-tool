const { Router } = require("express");
const MemberService = require("../services/MemberService");

const router = Router();

router.post("/", (req, res, next) => {
  const { name, nickname, abbreviation, color, teamId } = req.body;
  MemberService.create(name, nickname, abbreviation, color, teamId)
    .then((member) => {
      res.send(member);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", (req, res, next) => {
  MemberService.update(req.params.id, req.body)
    .then((member) => {
      res.send(member);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { memberRouter: router };
