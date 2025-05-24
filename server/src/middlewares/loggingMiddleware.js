const { logger } = require("../plugins/winston");

/**
 * Middleware to log every incoming request
 * @param {Request} req Incoming request object
 * @param {Response} res Outgoing response object
 * @param {Function} next Next handler function
 */
function loggerMiddleWare(req, _res, next) {
  if (req.path == "/health") return next();
  const { password, ...requestBody } = req.body;

  logger.info(
    `${req.method} ${req.url} ; Referrer: ${
      req.get("Referrer") || null
    } ; Body: ${JSON.stringify(requestBody)};`
  );
  next();
}

/**
 * Middleware to handle all errors
 * @param {Error} err Error to handle and to log
 * @param {Request} req Incoming request object
 * @param {Response} res Outgoing response object
 * @param {Function} next Next handler function (not called)
 */
function errorLoggingMiddleWare(err, _req, _res, next) {
  // Log the error message at the error level
  logger.error(err.message);
  next(err);
}

module.exports = { loggerMiddleWare, errorLoggingMiddleWare };
