const path = require("path");
const { version } = require("../package.json");

// EXPRESS REQUIREMENTS
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const robots = require("express-robots-txt");
const permissionsPolicy = require("permissions-policy");

// DATABASE
const db = require("./db");

// MIDDLEWARES
const {
  errorHandlingMiddleWare,
} = require("./middlewares/errorHandlingMiddleware");
const {
  errorLoggingMiddleWare,
  loggerMiddleWare,
} = require("./middlewares/loggingMiddleware");
const favicon = require("serve-favicon");

// LOGGER
const { logger } = require("./plugins/winston");
const logConfig = require("./utils/logConfig");

// ROUTERS
const { choreoRouter } = require("./routes/choreo");
const { teamRouter } = require("./routes/team");
const { clubRouter } = require("./routes/club");
const { hitRouter } = require("./routes/hit");
const { lineupRouter } = require("./routes/lineup");
const { memberRouter } = require("./routes/member");
const { positionRouter } = require("./routes/position");
const { userRouter } = require("./routes/user");
const { authRouter } = require("./routes/auth");
const { seasonRouter } = require("./routes/season");
const { seasonTeamRouter } = require("./routes/seasonTeam");
const { feedbackRouter } = require("./routes/feedback");

// ADMIN ROUTER
const { adminRouter } = require("./routes/admin");

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(robots(__dirname + "/public/robots.txt"));

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https:", "'unsafe-inline'"],
        "worker-src": ["'self'", "https:", "blob:"],
      },
    },
    referrerPolicy: {
      policy: ["strict-origin-when-cross-origin"],
    },
  })
);

const permPolicy = ["self", `"${process.env.FRONTEND_DOMAIN}"`];
console.log({ permPolicy });
app.use(
  permissionsPolicy({
    features: {
      accelerometer: permPolicy,
      ambientLightSensor: permPolicy,
      autoplay: permPolicy,
      battery: permPolicy,
      camera: permPolicy,
      displayCapture: permPolicy,
      documentDomain: permPolicy,
      documentWrite: permPolicy,
      encryptedMedia: permPolicy,
      executionWhileNotRendered: permPolicy,
      executionWhileOutOfViewport: permPolicy,
      fontDisplayLateSwap: permPolicy,
      fullscreen: permPolicy,
      geolocation: permPolicy,
      gyroscope: permPolicy,
      interestCohort: permPolicy,
      layoutAnimations: permPolicy,
      legacyImageFormats: permPolicy,
      loadingFrameDefaultEager: permPolicy,
      magnetometer: permPolicy,
      microphone: permPolicy,
      midi: permPolicy,
      navigationOverride: permPolicy,
      notifications: permPolicy,
      oversizedImages: permPolicy,
      payment: permPolicy,
      pictureInPicture: permPolicy,
      publickeyCredentials: permPolicy,
      push: permPolicy,
      serial: permPolicy,
      speaker: permPolicy,
      syncScript: permPolicy,
      syncXhr: permPolicy,
      unoptimizedImages: permPolicy,
      unoptimizedLosslessImages: permPolicy,
      unoptimizedLossyImages: permPolicy,
      unsizedMedia: permPolicy,
      usb: permPolicy,
      verticalScroll: permPolicy,
      vibrate: permPolicy,
      vr: permPolicy,
      wakelock: permPolicy,
      xr: permPolicy,
      xrSpatialTracking: permPolicy,
    },
  })
);

app.use(loggerMiddleWare);

app.set("view engine", "ejs");

app.use(
  require("express-status-monitor")({
    title: "Choreo Planer Server",
    path: "/status",
  })
);

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.get("/", (req, res) => {
  res.render("../src/views/status", {
    version,
    frontendDomain: process.env.FRONTEND_DOMAIN,
  });
});
app.get("/version", (req, res) => {
  res.send(version);
});
app.get("/health", (req, res, next) => {
  res.status(200).send();
  next();
});

app.use("/choreo", choreoRouter);
app.use("/team", teamRouter);
app.use("/club", clubRouter);
app.use("/hit", hitRouter);
app.use("/lineup", lineupRouter);
app.use("/member", memberRouter);
app.use("/position", positionRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/season", seasonRouter);
app.use("/seasonTeam", seasonTeamRouter);
app.use("/feedback", feedbackRouter);

app.use("/admin", adminRouter);

app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

function startServer() {
  logConfig();

  db.authenticate()
    .then(() => {
      logger.info("DB Connection established");

      app.listen(port, () => {
        logger.info(`App listening on http://localhost:${port}`);
      });
    })
    .catch((e) => {
      logger.error(
        "Unable to authenticate with the database. Restarting in 1 sec"
      );
      setTimeout(startServer, 1000);
    });
}

startServer();
