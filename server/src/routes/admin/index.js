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
const { adminRouter } = require("./admins");
const { userRouter } = require("./users");
const { notificationRouter } = require("./notification");
const NotificationService = require("../../services/NotificationService");

const router = Router();
router.use(function (req, res, next) {
  res.locals.path = req.baseUrl + req.path;
  res.locals.frontendDomain = process.env.FRONTEND_DOMAIN;

  // Remove empty query parameters
  const cleanedQuery = Object.fromEntries(
    Object.entries(req.query).filter(([_, v]) => v != null && v !== "")
  );
  if (Object.keys(cleanedQuery).length !== Object.keys(req.query).length) {
    const url = new URL(
      req.originalUrl,
      `${req.protocol}://${req.get("host")}`
    );
    url.search = new URLSearchParams(cleanedQuery).toString();
    return res.redirect(url.toString()); // njsscan-ignore: express_open_redirect
  }

  res.locals.query = cleanedQuery;
  next();
});

async function renderDashboard(req, res) {
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
    NotificationService.getReadPercentage(),
    NotificationService.getReadTrend(),
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
      notificationPercentage,
      notificationTrend,
    ]) => {
      return res.render("../src/views/admin/index.ejs", {
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
        notificationPercentage,
        notificationTrend,
      }); // njsscan-ignore: express_lfr_warning
    }
  );
}

router.get("/", authenticateAdmin(), resolveAdmin, (req, res, next) => {
  renderDashboard(req, res)
    .then(() => next())
    .catch((e) => next(e));
});

router.use("/db", authenticateAdmin(), resolveAdmin, dbRouter);
router.use("/users", authenticateAdmin(), resolveAdmin, userRouter);
router.use("/admins", authenticateAdmin(), resolveAdmin, adminRouter);
router.use(
  "/notifications",
  authenticateAdmin(),
  resolveAdmin,
  notificationRouter
);

module.exports = { adminRouter: router };
