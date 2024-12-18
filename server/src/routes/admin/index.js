const { Router } = require("express");
const {
  authenticateAdmin,
  resolveAdmin,
} = require("../../services/AuthService");

const AdminService = require("../../services/AdminService");
const UserService = require("../../services/UserService");
const ChoreoService = require("../../services/ChoreoService");
const ClubService = require("../../services/ClubService");
const MemberService = require("../../services/MemberService");
const SeasonService = require("../../services/SeasonService");
const SeasonTeamService = require("../../services/SeasonTeamService");
const TeamService = require("../../services/TeamService");
const FeedbackService = require("../../services/FeedbackService");
const { dbRouter } = require("./db");

const router = Router();
router.use(function (req, res, next) {
  res.locals.path = req.baseUrl + req.path;
  res.locals.frontendDomain = process.env.FRONTEND_DOMAIN;
  next();
});

router.get("/", authenticateAdmin(), resolveAdmin, (req, res, next) => {
  return Promise.all([
    AdminService.getCount(),
    AdminService.getTrend(),
    UserService.getCount(),
    UserService.getTrend(),
    ChoreoService.getCount(),
    ChoreoService.getTrend(),
    ClubService.getCount(),
    ClubService.getTrend(),
    MemberService.getCount(),
    MemberService.getTrend(),
    SeasonService.getCount(),
    SeasonService.getTrend(),
    SeasonTeamService.getCount(),
    SeasonTeamService.getTrend(),
    TeamService.getCount(),
    TeamService.getTrend(),
    FeedbackService.getNewest(),
    FeedbackService.getTotalAverage(),
    FeedbackService.getAverageOfLastMonth(),
  ]).then(
    ([
      adminCount,
      adminTrend,
      userCount,
      userTrend,
      choreoCount,
      choreoTrend,
      clubCount,
      clubTrend,
      memberCount,
      memberTrend,
      seasonCount,
      seasonTrend,
      seasonTeamCount,
      seasonTeamTrend,
      teamCount,
      teamTrend,
      newestFeedback,
      feedbackAverage,
      feedbackAverageOfLastMonth,
    ]) => {
      res.render("../src/views/admin/index.ejs", {
        username: req.Admin.username,
        adminCount,
        adminTrend,
        userCount,
        userTrend,
        choreoCount,
        choreoTrend,
        clubCount,
        clubTrend,
        memberCount,
        memberTrend,
        seasonCount,
        seasonTrend,
        seasonTeamCount,
        seasonTeamTrend,
        teamCount,
        teamTrend,
        newestFeedback,
        feedbackAverage,
        feedbackAverageOfLastMonth,
      });
      return next();
    }
  );
});

router.get("/users", authenticateAdmin(), resolveAdmin, (req, res, next) => {
  return Promise.all([UserService.getAll()]).then(([userList]) => {
    res.render("../src/views/admin/users.ejs", {
      username: req.Admin.username,
      userList,
    });
    return next();
  });
});

router.get("/admins", authenticateAdmin(), resolveAdmin, (req, res, next) => {
  return Promise.all([AdminService.getAll()]).then(([adminList]) => {
    res.render("../src/views/admin/admins.ejs", {
      username: req.Admin.username,
      adminList,
    });
    return next();
  });
});

router.use("/db", dbRouter);

module.exports = { adminRouter: router };
