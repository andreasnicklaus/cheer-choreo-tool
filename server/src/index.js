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

// LOGGER
const { logger } = require("./plugins/winston");

// ROUTERS
const { choreoRouter } = require("./routes/choreo");
const { teamRouter } = require("./routes/team");
const { clubRouter } = require("./routes/club");

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.use("/choreo", choreoRouter);
app.use("/team", teamRouter);
app.use("/club", clubRouter);

app.use(loggerMiddleWare);
app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

db.authenticate()
  .then(() => {
    logger.info("DB Connection established");
    app.listen(port, () => {
      logger.info(`Example app listening on port ${port}`);
    });
  })
  .catch((e) => {
    logger.error("Unable to authenticate with the database");
  });
