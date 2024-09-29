const { Router } = require("express");
const PositionService = require("../services/PositionService");
const LineupService = require("../services/LineupService");

const router = Router();

router.post("/", (req, res, next) => {
  const { startCount, endCount, choreoId } = req.body;
  LineupService.create(startCount, endCount, choreoId)
    .then((lineup) => {
      res.send(lineup);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", (req, res, next) => {
  LineupService.update(req.params.id, req.body)
    .then((lineup) => {
      res.send(lineup);
      return next();
    })
    .catch((e) => next(e));
});

router.post("/:id/position", (req, res, next) => {
  const { x, y, memberId } = req.body;
  PositionService.create(x, y)
    .then(async (position) => {
      return Promise.all([
        position.setMember(memberId),
        LineupService.findById(req.params.id).then((lineup) =>
          lineup.addPosition(position)
        ),
      ]).then(() =>
        PositionService.findById(position.id).then((p) => {
          res.send(p);
          next();
        })
      );
    })
    .catch((e) => next(e));
});

router.put("/:id/position/:positionId", (req, res, next) => {
  PositionService.update(req.params.positionId, req.params.id, req.body)
    .then((position) => {
      res.send(position);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  LineupService.remove(req.params.id)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { lineupRouter: router };
