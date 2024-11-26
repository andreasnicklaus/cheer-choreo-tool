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

// APP
const app = express();
app.use(bodyParser.json());
app.use(loggerMiddleWare);

const port = process.env.MAILPROXY_HOST || 3000;

app.get("/", (req, res, next) => {
  res.send(`Server is up and running!`);
  next();
});

app.use("/", authenticate, router);

app.use(errorLoggingMiddleWare);
app.use(errorHandlingMiddleWare);

function startServer() {
  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
}

startServer();
