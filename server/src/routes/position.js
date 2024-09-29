const { Router } = require("express");
const PositionService = require("../services/PositionService");

const router = Router();

router.post("/", (req, res, next) => {
  const { x, y, memberId, lineupId } = req.body;
  PositionService.create(x, y)
    .then(async (position) => {
      return Promise.all([
        position.setMember(memberId),
        LineupService.findById(lineupId).then((lineup) =>
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

router.put("/:id", (req, res, next) => {
  PositionService.update(req.params.id, req.body)
    .then((position) => {
      res.send(position);
      next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", (req, res, next) => {
  PositionService.remove(req.params.id)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { positionRouter: router };
