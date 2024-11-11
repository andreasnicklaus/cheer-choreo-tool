const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const SeasonService = require("../services/SeasonService");

const router = Router();

router.get("/", authenticateUser, (req, res, next) => {
  return SeasonService.getAll(req.UserId)
    .then((seasonList) => {
      res.send(seasonList);
      return next();
    })
    .catch((e) => next(e));
});

router.post("/", authenticateUser, (req, res, next) => {
  const { name, year } = req.body;
  return SeasonService.create(name, year, req.UserId)
    .then((season) => {
      res.send(season);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { seasonRouter: router };
