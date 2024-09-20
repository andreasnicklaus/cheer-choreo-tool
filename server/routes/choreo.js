const { Router } = require("express");
const ChoreoService = require("../services/ChoreoService");

const router = Router();

router.get("/", (req, res, next) => {
  try {
    if (req.query.teamId)
      res.send(ChoreoService.findByTeamId(req.query.teamId));
    else res.send(ChoreoService.getAll());
    return next();
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const foundChoreo = ChoreoService.findByTeamId(req.params.id);
    res.send(foundChoreo);
    return next();
  } catch (e) {
    return next(e);
  }
});

router.post("/", (req, res, next) => {
  try {
    let idNew;
    while (!idNew && choreos.find((c) => c.id == idNew)) {
      idNew = (Math.random() + 1).toString(36).substring(7);
    }
    const choreoNew = { ...req.body, id: idNew };
    choreos.push(choreoNew);
    res.send(choreoNew);
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = { choreoRouter: router };
