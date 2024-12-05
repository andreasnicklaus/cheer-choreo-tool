const { Router } = require("express");
const ClubService = require("../services/ClubService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/:id?", authenticateUser(), (req, res, next) => {
  if (req.params.id)
    return ClubService.findById(req.params.id, req.UserId)
      .then((foundClub) => {
        if (!foundClub) res.status(404).send("Not found");
        else res.send(foundClub);
        return next();
      })
      .catch((e) => next(e));
  else {
    if (req.query.name)
      return ClubService.findByName(req.query.name, req.UserId)
        .then((clubList) => {
          res.send(clubList);
          return next();
        })
        .catch((e) => next(e));
    else
      return ClubService.getAll(req.UserId)
        .then((clubList) => {
          res.send(clubList);
          return next();
        })
        .catch((e) => next(e));
  }
});

router.post("/", authenticateUser(), (req, res, next) => {
  const { name } = req.body;
  return ClubService.create(name, req.UserId)
    .then((club) => {
      res.send(club);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser(), (req, res, next) => {
  return ClubService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser(), (req, res, next) => {
  return ClubService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { clubRouter: router };
