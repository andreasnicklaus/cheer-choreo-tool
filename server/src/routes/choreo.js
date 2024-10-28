const { Router } = require("express");
const ChoreoService = require("../services/ChoreoService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/:id?", authenticateUser, (req, res, next) => {
  if (req.params.id)
    ChoreoService.findById(req.params.id, req.UserId)
      .then((foundChoreo) => {
        // console.log(foundChoreo.Lineups.length);
        if (!foundChoreo) res.status(404).send("Not found");
        else res.send(foundChoreo);
        return next();
      })
      .catch((e) => next(e));
  else {
    if (req.query.teamId)
      ChoreoService.findByTeamId(req.query.teamId, req.UserId)
        .then((choreoList) => {
          res.send(choreoList);
          return next();
        })
        .catch((e) => next(e));
    else
      ChoreoService.getAll(req.UserId)
        .then((choreoList) => {
          res.send(choreoList);
          return next();
        })
        .catch((e) => next(e));
  }
});

router.post("/", authenticateUser, (req, res, next) => {
  const { name, counts, teamId } = req.body;
  return ChoreoService.create(name, counts, teamId, req.UserId)
    .then((choreo) => {
      res.send(choreo);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser, (req, res, next) => {
  return ChoreoService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  return ChoreoService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { choreoRouter: router };
