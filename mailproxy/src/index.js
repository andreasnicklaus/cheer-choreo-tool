// EXPRESS REQUIREMENTS
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

// MIDDLEWARES
const {
  loggerMiddleWare,
  errorLoggingMiddleWare,
} = require("./middlewares/loggingMiddleware");
const {
  errorHandlingMiddleWare,
} = require("./middlewares/errorHandlingMiddleware");

// ROUTERS
const router = require("./routes");
const authenticate = require("./auth");
const logConfig = require("./utils/logConfig");
const { logger } = require("./plugins/winston");

// APP
const app = express();
app.use(bodyParser.json());
app.use(loggerMiddleWare);

const port = process.env.MAILPROXY_HOST || 3000;

app.get("/", (req, res, next) => {
  res.send(`Server is up and running!`);
  next();
});
app.get("/health", (req, res, next) => {
  res.status(200).send();
  next();
});

app.use("/", authenticate, router);

app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

function startServer() {
  logConfig();

  app.listen(port, () => {
    logger.info(`App listening on port ${port}`);
  });
}

startServer();
