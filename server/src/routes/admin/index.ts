import { NextFunction, Request, Response, Router } from "express";
import { dbRouter } from "./db";
import { userRouter } from "./users";
import { adminsRouter } from "./admins";
import { notificationRouter } from "./notification";
import AuthService from "../../services/AuthService";
import AdminService from "../../services/AdminService";
import UserService from "../../services/UserService";
import ChoreoService from "../../services/ChoreoService";
import ClubService from "../../services/ClubService";
import MemberService from "../../services/MemberService";
import SeasonService from "../../services/SeasonService";
import SeasonTeamService from "../../services/SeasonTeamService";
import TeamService from "../../services/TeamService";
import FeedbackService from "../../services/FeedbackService";
import NotificationService from "../../services/NotificationService";

const router = Router();

router.use(function (req: Request, res: Response, next: NextFunction) {
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
    url.search = new URLSearchParams(
      Object.fromEntries(
        Object.entries(cleanedQuery).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : String(v)])
      )
    ).toString();
    return res.redirect(url.toString()); // njsscan-ignore: express_open_redirect
  }

  res.locals.query = cleanedQuery;
  next();
});

async function renderDashboard(req: Request, res: Response) {
  return Promise.all([
    AdminService.getCount(),
    AdminService.getTrend(),
    UserService.getCount(),
    UserService.getTrend(),
    UserService.getLoggedInPercentage(),
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
      usersLoggedInPercentage,
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
        usersLoggedInPercentage,
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

router.get(
  "/",
  AuthService.authenticateAdmin(),
  AuthService.resolveAdmin,
  (req: Request, res: Response, next: NextFunction) => {
    return renderDashboard(req, res)
      .then(() => next())
      .catch((e) => next(e));
  }
);

router.use("/db", AuthService.authenticateAdmin(), AuthService.resolveAdmin, dbRouter);
router.use("/users", AuthService.authenticateAdmin(), AuthService.resolveAdmin, userRouter);
router.use(
  "/admins",
  AuthService.authenticateAdmin(),
  AuthService.resolveAdmin,
  adminsRouter
);
router.use(
  "/notifications",
  AuthService.authenticateAdmin(),
  AuthService.resolveAdmin,
  notificationRouter
);

export { router as adminRouter };
