const { Router } = require("express");
const ClubService = require("../services/ClubService");

const router = Router();

router.get("/:id", (req, res, next) => {
  try {
    const foundClub = ClubService.findById(req.params.id);
    res.send(foundClub);
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = { clubRouter: router };
