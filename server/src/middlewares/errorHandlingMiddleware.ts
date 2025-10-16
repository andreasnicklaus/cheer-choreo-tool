import { NextFunction, Request, Response } from "express";

/**
 * Middleware to send an appropriate status code response depending on the occurring error.
 * - {@link NotFoundError}: status code 404
 * @param {Error} err Error to handle and to log
 * @param {Request} req Incoming request object
 * @param {Response} res Outgoing response object
 * @param {Function} next Next handler function (not called)
 */
function errorHandlingMiddleWare(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!res.headersSent) {
    res.status(500).render("../src/views/error.ejs", {
      action: "generic error handling",
      data: JSON.stringify({ userId: req.UserId, url: req.url }),
      error: error,
      timestamp: new Date().toLocaleString(req.locale),
    }); // njsscan-ignore: express_lfr_warning
  }
  next(error);
}

module.exports = { errorHandlingMiddleWare };
