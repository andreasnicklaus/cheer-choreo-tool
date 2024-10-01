const { Router } = require("express");
const HitService = require("../services/HitService");
const MemberService = require("../services/MemberService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/:id?", authenticateUser, (req, res, next) => {
  if (req.params.id)
    return HitService.findById(req.params.id, req.UserId)
      .then((foundHit) => {
        if (!foundHit) res.status(404).send("Not found");
        else res.send(foundHit);
        return next();
      })
      .catch((e) => next(e));
  else {
    return HitService.getAll(req.UserId)
      .then((hitList) => {
        res.send(hitList);
        return next();
      })
      .catch((e) => next(e));
  }
});

router.post("/", authenticateUser, (req, res, next) => {
  const { name, count, choreoId, memberIds = [] } = req.body;
  return HitService.create(name, count, choreoId, memberIds, req.UserId)
    .then((hit) => {
      res.send(hit);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser, (req, res, next) => {
  return HitService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  return HitService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { hitRouter: router };
