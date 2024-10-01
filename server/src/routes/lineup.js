const { Router } = require("express");
const PositionService = require("../services/PositionService");
const LineupService = require("../services/LineupService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.post("/", authenticateUser, (req, res, next) => {
  const { startCount, endCount, choreoId } = req.body;
  LineupService.create(startCount, endCount, choreoId, req.UserId)
    .then((lineup) => {
      res.send(lineup);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser, (req, res, next) => {
  LineupService.update(req.params.id, req.body, req.UserId)
    .then((lineup) => {
      res.send(lineup);
      return next();
    })
    .catch((e) => next(e));
});

router.post("/:id/position", authenticateUser, (req, res, next) => {
  const { x, y, memberId } = req.body;
  PositionService.create(x, y, req.UserId)
    .then(async (position) => {
      return Promise.all([
        position.setMember(memberId),
        LineupService.findById(req.params.id, req.UserId).then((lineup) =>
          lineup.addPosition(position)
        ),
      ]).then(() =>
        PositionService.findById(position.id, req.UserId).then((p) => {
          res.send(p);
          next();
        })
      );
    })
    .catch((e) => next(e));
});

router.put("/:id/position/:positionId", authenticateUser, (req, res, next) => {
  PositionService.update(req.params.positionId, req.params.id, req.body, req.UserId)
    .then((position) => {
      res.send(position);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  LineupService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { lineupRouter: router };
