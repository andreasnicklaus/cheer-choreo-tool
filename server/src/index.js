const path = require("path");
const { version } = require("../package.json");

// EXPRESS REQUIREMENTS
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

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

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

app.use(loggerMiddleWare);

app.use(
  require("express-status-monitor")({
    title: "Choreo Planer Server",
    path: "/status",
  })
);

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.get("/", (req, res) => {
  res.send(`Server is up and running! Current Version: ${version}`);
});
app.get("/version", (req, res) => {
  res.send(version);
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

app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

function startServer() {
  db.authenticate()
    .then(() => {
      logger.info("DB Connection established");

      app.listen(port, () => {
        logger.info(`Example app listening on port ${port}`);
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
