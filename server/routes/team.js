const { Router } = require("express");
const { default: TeamService } = require("../services/TeamService");

const router = Router();

router.get("/", (req, res, next) => {
  try {
    if (req.query.name) res.send(TeamService.findByName(req.query.name));
    else res.send(TeamService.getAll());
    return next();
  } catch (e) {
    next(e);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    res.send(TeamService.findById(req.params.id));
    return next();
  } catch (e) {
    next(e);
  }
});

router.post("/", (req, res, next) => {
  try {
    let idNew;
    while (!idNew && teams.find((c) => c.id == idNew)) {
      idNew = (Math.random() + 1).toString(36).substring(7);
    }
    const teamNew = { ...req.body, id: idNew };
    teams.push(teamNew);
    res.send(teamNew);
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = { teamRouter: router };
