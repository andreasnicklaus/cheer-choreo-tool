const { Router } = require("express");
const HitService = require("../services/Hitservice");
const MemberService = require("../services/MemberService");

const router = Router();

router.get("/:id?", (req, res, next) => {
  if (req.params.id)
    return HitService.findById(req.params.id)
      .then((foundHit) => {
        if (!foundHit) res.status(404).send("Not found");
        else res.send(foundHit);
        return next();
      })
      .catch((e) => next(e));
  else {
    return HitService.getAll()
      .then((hitList) => {
        res.send(hitList);
        return next();
      })
      .catch((e) => next(e));
  }
});

router.post("/", (req, res, next) => {
  const { name, count, choreoId, memberIds = [] } = req.body;
  return HitService.create(name, count, choreoId, memberIds)
    .then((hit) => {
      res.send(hit);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", (req, res, next) => {
  return HitService.update(req.params.id, req.body)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  return HitService.remove(req.params.id)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { hitRouter: router };
