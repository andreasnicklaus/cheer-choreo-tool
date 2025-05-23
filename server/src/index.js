const path = require("path");
const { version } = require("../package.json");

const crypto = require("crypto");

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
const { notificationRouter } = require("./routes/notification");

// ADMIN ROUTER
const { adminRouter } = require("./routes/admin");

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_DOMAIN,
  })
);
app.use(robots(__dirname + "/public/robots.txt"));

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100,
  })
);

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(32).toString("hex");
  next();
});
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    contentSecurityPolicy: {
      directives: {
        "script-src": [
          "'self'",
          "https:",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
        "worker-src": ["'self'", "https:", "blob:"],
        upgradeInsecureRequests: null,
      },
    },
    referrerPolicy: {
      policy: ["strict-origin-when-cross-origin"],
    },
  })
);

const permPolicy = ["self", `"${process.env.FRONTEND_DOMAIN}"`];
app.use(
  permissionsPolicy({
    features: {
      accelerometer: permPolicy,
      // ambientLightSensor: permPolicy,
      autoplay: permPolicy,
      // battery: permPolicy,
      camera: permPolicy,
      displayCapture: permPolicy,
      // documentDomain: permPolicy,
      // documentWrite: permPolicy,
      encryptedMedia: permPolicy,
      // executionWhileNotRendered: permPolicy,
      // executionWhileOutOfViewport: permPolicy,
      // fontDisplayLateSwap: permPolicy,
      fullscreen: permPolicy,
      geolocation: permPolicy,
      gyroscope: permPolicy,
      interestCohort: permPolicy,
      // layoutAnimations: permPolicy,
      // legacyImageFormats: permPolicy,
      // loadingFrameDefaultEager: permPolicy,
      magnetometer: permPolicy,
      microphone: permPolicy,
      midi: permPolicy,
      // navigationOverride: permPolicy,
      // notifications: permPolicy,
      // oversizedImages: permPolicy,
      payment: permPolicy,
      pictureInPicture: permPolicy,
      // publickeyCredentials: permPolicy,
      // push: permPolicy,
      serial: permPolicy,
      // speaker: permPolicy,
      // syncScript: permPolicy,
      syncXhr: permPolicy,
      // unoptimizedImages: permPolicy,
      // unoptimizedLosslessImages: permPolicy,
      // unoptimizedLossyImages: permPolicy,
      // unsizedMedia: permPolicy,
      usb: permPolicy,
      // verticalScroll: permPolicy,
      // vibrate: permPolicy,
      // vr: permPolicy,
      // wakeLock: permPolicy,
      // xr: permPolicy,
      xrSpatialTracking: permPolicy,
    },
  })
);

app.use(loggerMiddleWare);

app.set("view engine", "ejs");

app.use(
  "/status",
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https:", "'unsafe-inline'"],
      },
    },
  })
);
app.use(
  require("express-status-monitor")({
    title: "Choreo Planer Server",
    path: "/status",
    ignoreStartsWith: "/admin",
  })
);

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// INTERNATIONALIZATION
require("./plugins/i18n");
const i18n = require("i18n");
app.use(i18n.init);

/**
 * @swagger
 * tags:
 *    name: General
 *    description: General-purpose endpoints
 */

/**
 * @openapi
 * /:
 *    get:
 *      description: Status page for the API server
 *      tags:
 *      - General
 *      responses:
 *        200:
 *          description: Returns a status page with a positive status message and the server version
 */
app.get("/", (req, res) => {
  res.render("../src/views/status", {
    version,
    frontendDomain: process.env.FRONTEND_DOMAIN,
  }); // njsscan-ignore: express_lfr_warning
});

/**
 * @openapi
 * /version:
 *    get:
 *      description: Server version
 *      tags:
 *      - General
 *      responses:
 *        200:
 *          description: Returns the server version
 */
app.get("/version", (req, res) => {
  res.send(version);
});

/**
 * @openapi
 * /health:
 *   get:
 *     description: Healthcheck
 *     tags:
 *     - General
 *     responses:
 *       200:
 *         description: Returns status code 200 for healthchecks (not logged)
 */
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
app.use("/notifications", notificationRouter);

app.use("/admin", adminRouter);

app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

// SWAGGER DOC
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Choreo Planer",
      version: "0.0.1",
      description: "This is the Choreo Planer API documentation",
      license: {
        name: "MIT",
        url: "https://mit-license.org/",
      },
      contact: {
        name: "Administrator",
        email: "admin@choreo-planer.de",
      },
      version,
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development Server",
      },
      {
        url: "https://www.choreo-planer.de",
        description: "Production Server",
      },
    ],
  },
  apis: [
    __dirname + "/routes/**/*.js",
    __dirname + "/index.js",
    __dirname + "/docDefs.js",
    __dirname + "/db/models/*.js",
  ],
};

const specs = swaggerJsdoc(swaggerOptions);
/**
 * @openapi
 * /api-docs:
 *   get:
 *     description: This API documentation
 *     tags:
 *     - General
 *     responses:
 *       200:
 *         description: Returns this documentation web page
 */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customSiteTitle: "Choreo Planer API Docs",
    customfavIcon: "/favicon.ico",
  })
);

app.use(
  "/docs",
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https:", "'unsafe-inline'"],
      },
    },
  })
);
/**
 * @openapi
 * /docs:
 *   get:
 *     description: JsDoc documentation
 *     tags:
 *     - General
 *     responses:
 *       200:
 *         description: JsDoc documentation
 */
app.use("/docs", express.static(path.join(__dirname, "docs")));

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
