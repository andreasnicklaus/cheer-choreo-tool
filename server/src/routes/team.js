const { Router } = require("express");
const TeamService = require("../services/TeamService");

const router = Router();

router.get("/:id?", (req, res, next) => {
  if (req.params.id)
    return TeamService.findById(req.params.id)
      .then((team) => {
        console.log(team);
        res.send(team);
        return next();
      })
      .catch((e) => {
        next(e);
      });
  else {
    if (req.query.name)
      return TeamService.findByName(req.query.name)
        .then((foundTeam) => {
          if (!foundTeam) res.status(404).send("Not found");
          else res.send(foundTeam);
          return next();
        })
        .catch((e) => next(e));
    else
      return TeamService.getAll()
        .then((foundTeams) => {
          res.send(foundTeams);
          return next();
        })
        .catch((e) => next(e));
  }
});

router.post("/", (req, res, next) => {
  const { name, clubId } = req.body;
  return TeamService.create(name, clubId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", (req, res, next) => {
  return TeamService.update(req.params.id, req.body)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  return TeamService.remove(req.params.id)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { teamRouter: router };
