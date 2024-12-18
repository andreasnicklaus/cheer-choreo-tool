const { Router } = require("express");
const {
  authenticateAdmin,
  resolveAdmin,
} = require("../../services/AuthService");
const ClubService = require("../../services/ClubService");
const TeamService = require("../../services/TeamService");
const SeasonService = require("../../services/SeasonService");
const MemberService = require("../../services/MemberService");
const ChoreoService = require("../../services/ChoreoService");

const router = Router();

router.get("/", authenticateAdmin(), resolveAdmin, (req, res, next) => {
  res.render("../src/views/admin/db.ejs", {
    username: req.Admin.username,
  });
  return next();
});

router.get(
  "/:entity",
  authenticateAdmin(),
  resolveAdmin,
  async (req, res, next) => {
    const UserId = req.query.UserId || null;
    let columns, data;
    switch (req.params.entity) {
      case "clubs":
        columns = ["name"];
        data = await ClubService.getAll(UserId, { all: true });
        break;
      case "teams":
        columns = ["name"];
        data = await TeamService.getAll(UserId, { all: true });
        break;
      case "seasons":
        columns = ["year", "name"];
        data = await SeasonService.getAll(UserId, { all: true });
        break;
      // case "seasonTeams":
      //   columns = ["name"];
      //   data = await TeamService.getAll(UserId, { all: true });
      //   break;
      case "members":
        columns = ["name", "nickname", "abbreviation"];
        data = await MemberService.getAll(UserId, { all: true });
        break;
      case "choreos":
        columns = ["name", "counts"];
        data = await ChoreoService.getAll(UserId, { all: true });
        break;
    }
    res.render("../src/views/admin/db.ejs", {
      username: req.Admin.username,
      columns,
      data,
    });
    return next();
  }
);

module.exports = { dbRouter: router };
