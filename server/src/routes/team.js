const { Router } = require("express");
const TeamService = require("../services/TeamService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/:id?", authenticateUser, (req, res, next) => {
  if (req.params.id)
    return TeamService.findById(req.params.id, req.UserId)
      .then((team) => {
        res.send(team);
        return next();
      })
      .catch((e) => {
        next(e);
      });
  else {
    if (req.query.name)
      return TeamService.findByName(req.query.name, req.UserId)
        .then((foundTeam) => {
          if (!foundTeam) res.status(404).send("Not found");
          else res.send(foundTeam);
          return next();
        })
        .catch((e) => next(e));
    else
      return TeamService.getAll(req.UserId)
        .then((foundTeams) => {
          res.send(foundTeams);
          return next();
        })
        .catch((e) => next(e));
  }
});

router.post("/", authenticateUser, (req, res, next) => {
  const { name, clubId, seasonId } = req.body;
  return TeamService.create(name, clubId, seasonId, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser, (req, res, next) => {
  return TeamService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  return TeamService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { teamRouter: router };
