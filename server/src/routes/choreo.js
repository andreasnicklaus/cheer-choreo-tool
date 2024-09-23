const { Router } = require("express");
const ChoreoService = require("../services/ChoreoService");

const router = Router();

router.get("/:id?", (req, res, next) => {
  if (req.params.id)
    ChoreoService.findById(req.params.id)
      .then((foundChoreo) => {
        if (!foundChoreo) res.status(404).send("Not found");
        else res.send(foundChoreo);
        return next();
      })
      .catch((e) => next(e));
  else {
    if (req.query.teamId)
      ChoreoService.findByTeamId(req.query.teamId)
        .then((choreoList) => {
          res.send(choreoList);
          return next();
        })
        .catch((e) => next(e));
    else
      ChoreoService.getAll()
        .then((choreoList) => {
          res.send(choreoList);
          return next();
        })
        .catch((e) => next(e));
  }
});

router.post("/", (req, res, next) => {
  const { name, count } = req.body;
  return ChoreoService.create(name, count)
    .then((choreo) => {
      res.send(choreo);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", (req, res, next) => {
  return ChoreoService.update(req.params.id, req.body)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  return ChoreoService.remove(req.params.id)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { choreoRouter: router };
