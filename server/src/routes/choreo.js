const { Router } = require("express");
const ChoreoService = require("../services/ChoreoService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

router.get("/:id?", authenticateUser, (req, res, next) => {
  if (req.params.id)
    ChoreoService.findById(req.params.id, req.UserId)
      .then((foundChoreo) => {
        if (!foundChoreo) res.status(404).send("Not found");
        else res.send(foundChoreo);
        return next();
      })
      .catch((e) => next(e));
  else {
    ChoreoService.getAll(req.UserId)
      .then((choreoList) => {
        res.send(choreoList);
        return next();
      })
      .catch((e) => next(e));
  }
});

router.post("/", authenticateUser, (req, res, next) => {
  const { name, counts, seasonTeamId, participants } = req.body;
  return ChoreoService.create(
    name,
    counts,
    seasonTeamId,
    participants,
    req.UserId
  )
    .then((choreo) => {
      res.send(choreo);
      return next();
    })
    .catch((e) => next(e));
});

router.put("/:id", authenticateUser, (req, res, next) => {
  return ChoreoService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  return ChoreoService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.post("/:id/participants", authenticateUser, (req, res, next) => {
  const { memberId, color } = req.body;
  return ChoreoService.addParticipant(
    req.params.id,
    memberId,
    req.UserId,
    color
  )
    .then(() => {
      res.send();
      return next();
    })
    .catch((e) => next(e));
});

router.delete(
  "/:id/participants/:participationId",
  authenticateUser,
  (req, res, next) => {
    return ChoreoService.removeParticipant(
      req.params.id,
      req.params.participationId,
      req.UserId
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e) => next(e));
  }
);

router.patch("/:id/participants", authenticateUser, (req, res, next) => {
  const { memberToRemoveId, memberToAddId } = req.body;
  return ChoreoService.replaceParticipant(
    req.params.id,
    memberToAddId,
    memberToRemoveId,
    req.UserId
  )
    .then((choreo) => {
      res.send(choreo);
      return next();
    })
    .catch((e) => next(e));
});

router.patch("/:id/participants/:participantId", authenticateUser, (req, res, next) => {
  const { color } = req.body;
  return ChoreoService.changeParticipationColor(
    req.params.id,
    req.params.participantId,
    color,
    req.UserId
  )
    .then(() => {
      res.send();
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { choreoRouter: router };
