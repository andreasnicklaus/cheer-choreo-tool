import { NextFunction, Request, Response } from "express";

import path = require("path");
const { version } = require("../package.json");

// EXPRESS REQUIREMENTS
import express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const robots = require("express-robots-txt");
const permissionsPolicy = require("permissions-policy");

// DATABASE
import db from "./db";

// MIDDLEWARES
const {
  errorHandlingMiddleWare,
} = require("./middlewares/errorHandlingMiddleware");
import {
  errorLoggingMiddleWare,
  loggerMiddleWare,
} from "./middlewares/loggingMiddleware";
import { totalRateLimit } from "./middlewares/rateLimitMiddleware";

const favicon = require("serve-favicon");

// LOGGER
const { logger } = require("./plugins/winston");
import logConfig from "@/utils/logConfig";

// HEALTH
import { getHealthReport } from "@/utils/healthCheck";

// SESSION
import session from "express-session";

// PASSPORT
import passport from "passport";
import { configurePassport } from "./plugins/passport";
configurePassport();

// ROUTERS
import { choreoRouter } from "./routes/choreo";
import { teamRouter } from "./routes/team";
import { clubRouter } from "./routes/club";
import { hitRouter } from "./routes/hit";
import { lineupRouter } from "./routes/lineup";
import { memberRouter } from "./routes/member";
import { positionRouter } from "./routes/position";
import { userRouter } from "./routes/user";
import { authRouter } from "./routes/auth";
import { seasonRouter } from "./routes/season";
import { seasonTeamRouter } from "./routes/seasonTeam";
import { feedbackRouter } from "./routes/feedback";
import { notificationRouter } from "./routes/notification";
import { contactRouter } from "./routes/contact";

// MCP
import { mcpRouter } from "./mcp";

// ADMIN ROUTER
import { adminRouter } from "./routes/admin/index";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const corsWhiteList = [
  process.env.FRONTEND_DOMAIN,
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
];
app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: { (err: Error | null, allow?: boolean): void },
    ) {
      if (
        !origin ||
        corsWhiteList.includes(origin) ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    allowedHeaders: "*",
    exposedHeaders: ["X-CSRF-Token", "mcp-session-id"],
  }),
);
app.use(robots(__dirname + "/public/robots.txt"));

app.set("trust proxy", 1);
app.use(totalRateLimit);

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.locals.cspNonce = require("crypto").randomBytes(32).toString("hex");
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
          (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
        ],
        "worker-src": ["'self'", "https:", "blob:"],
        "connect-src": [
          "'self'",
          "https:",
          "blob:",
          process.env.FRONTED_DOMAIN,
          "ws:",
        ],
        upgradeInsecureRequests: null,
      },
    },
    referrerPolicy: {
      policy: ["strict-origin-when-cross-origin"],
    },
  }),
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
  }),
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
  }),
);
app.use(
  require("express-status-monitor")({
    title: "Choreo Planer Server",
    path: "/status",
    ignoreStartsWith: "/admin",
  }),
);

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// INTERNATIONALIZATION
require("./plugins/i18n");
const i18n = require("i18n");
app.use(i18n.init);

// SESSION & PASSPORT
const sessionSecret = process.env.SESSION_SECRET || "choreo-session-secret";
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "choreo.sid",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000, // 10 minutes — only needed during OAuth flow
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

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
 *      description: Server Status
 *      tags:
 *      - General
 *      responses:
 *        200:
 *          description: Returns a status page with a positive status message and the server version
 */
app.get("/", async (_req: Request, res: Response) => {
  const health = await getHealthReport();
  res.render("../src/views/status", {
    version,
    frontendDomain: process.env.FRONTEND_DOMAIN,
    health,
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
app.get("/version", (_req: Request, res: Response) => {
  res.send(version);
});

/**
 * @openapi
 * /health:
 *   get:
 *     description: Healthcheck with detailed service status
 *     tags:
 *     - General
 *     responses:
 *       200:
 *         description: All required services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: integer
 *                 formattedUptime:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unhealthy]
 *                         required:
 *                           type: boolean
 *                         message:
 *                           type: string
 *                     mail:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unhealthy, unconfigured, error]
 *                         required:
 *                           type: boolean
 *                         message:
 *                           type: string
 *                     featureFlags:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unhealthy, unconfigured, error]
 *                         required:
 *                           type: boolean
 *                         message:
 *                           type: string
 *                     logging:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unconfigured]
 *                         required:
 *                           type: boolean
 *                 featureFlags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                 oauthProviders:
 *                   type: array
 *                   items:
 *                     type: string
 *       503:
 *         description: One or more required services are unhealthy
 */
app.get("/health", async (_req: Request, res: Response, next: NextFunction) => {
  const report = await getHealthReport();
  const httpStatus = report.services.database.status === "healthy" ? 200 : 503;
  res.status(httpStatus).json(report);
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
app.use("/mcp", mcpRouter);
app.use("/season", seasonRouter);
app.use("/seasonTeam", seasonTeamRouter);
app.use("/feedback", feedbackRouter);
app.use("/notifications", notificationRouter);
app.use("/contact", contactRouter);

app.use("/admin", adminRouter);

// SWAGGER DOC
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerFileExtension = process.env.NODE_ENV == "production" ? "js" : "ts";
const swaggerOptions = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Choreo Planer",
      description:
        "This is the official Choreo Planer API documentation. Use this documentation as reference to integrate with the Choreo Planer backend.",
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
    externalDocs: {
      description: "Backend Code Documentation",
      url: "https://api.choreo-planer.de/docs/",
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
    `${__dirname}/routes/**/*.${swaggerFileExtension}`,
    `${__dirname}/index.${swaggerFileExtension}`,
    `${__dirname}/docDefs.${swaggerFileExtension}`,
    `${__dirname}/db/models/*.${swaggerFileExtension}`,
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
  }),
);

app.use(
  "/docs",
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https:", "'unsafe-inline'"],
        "img-src": ["'self'", "https:", "data:"],
      },
    },
  }),
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
app.use(
  "/docs",
  express.static(
    path.join(
      __dirname,
      process.env.NODE_ENV == "production" ? "docs" : "../dist/docs",
    ),
    { dotfiles: "allow" },
  ),
);

app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

function startServer() {
  logConfig();

  db.authenticate()
    .then(() => logger.info("DB Connection established"))
    .catch((e) =>
      logger.warn("DB not available at startup: " + (e.message || String(e))),
    );

  app.listen(port, (error) => {
    if (error) throw error;
    logger.info(`App listening on http://localhost:${port}`);
  });
}

startServer();
