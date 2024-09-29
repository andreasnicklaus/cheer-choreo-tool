const { Router } = require("express");
const ClubService = require("../services/ClubService");

const router = Router();

router.get("/:id?", (req, res, next) => {
  if (req.params.id)
    return ClubService.findById(req.params.id)
      .then((foundClub) => {
        if (!foundClub) res.status(404).send("Not found");
        else res.send(foundClub);
        return next();
      })
      .catch((e) => next(e));
  else {
    if (req.query.name)
      return ClubService.findByName(req.query.name)
        .then((clubList) => {
          res.send(clubList);
          return next();
        })
        .catch((e) => next(e));
    else
      return ClubService.getAll()
        .then((clubList) => {
          res.send(clubList);
          return next();
        })
        .catch((e) => next(e));
  }
});

router.post("/", (req, res, next) => {
  const { name } = req.body;
  return ClubService.create(name)
    .then((club) => {
      res.send(club);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", (req, res, next) => {
  return ClubService.update(req.params.id, req.body)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  return ClubService.remove(req.params.id)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { clubRouter: router };
