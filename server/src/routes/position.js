const { Router } = require("express");
const PositionService = require("../services/PositionService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/", authenticateUser, (req, res, next) => {
  if (req.query.lineupId)
    PositionService.findByLineupId(req.query.lineupId, req.UserId)
      .then((foundPositions) => {
        res.send(foundPositions);
        return next();
      })
      .catch((e) => next(e));
});

router.post("/", authenticateUser, (req, res, next) => {
  const { x, y, memberId, lineupId } = req.body;
  PositionService.create(x, y, req.UserId)
    .then(async (position) => {
      return Promise.all([
        position.setMember(memberId),
        LineupService.findById(lineupId, req.UserId).then((lineup) =>
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

router.put("/:id", authenticateUser, (req, res, next) => {
  PositionService.update(req.params.id, req.body, req.UserId)
    .then((position) => {
      res.send(position);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  PositionService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { positionRouter: router };
