const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const SeasonTeamService = require("../services/SeasonTeamService");

const router = Router();

router.post("/", authenticateUser, (req, res, next) => {
  const { teamId, seasonId, memberIds = [] } = req.body;
  return SeasonTeamService.create(teamId, seasonId, memberIds, req.UserId)
    .then((seasonTeam) => {
      res.send(seasonTeam);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser, (req, res, next) => {
  const { memberIds } = req.body;
  return SeasonTeamService.copyMembersIntoSeasonTeam(
    req.params.id,
    memberIds,
    req.UserId
  )
    .then((memberList) => {
      res.send(memberList);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  return SeasonTeamService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { seasonTeamRouter: router };
