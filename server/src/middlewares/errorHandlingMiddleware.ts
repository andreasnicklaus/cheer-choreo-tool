import { NextFunction, Request, Response } from "express";

/**
 * Middleware to send an appropriate status code response depending on the occurring error.
 * - {@link NotFoundError}: status code 404
 * @param {Error} err Error to handle and to log
 * @param {Request} req Incoming request object
 * @param {Response} res Outgoing response object
 * @param {Function} next Next handler function (not called)
 */
function errorHandlingMiddleWare(error: Error, _req: Request, res: Response, next: NextFunction) {
  if (!res.headersSent) {
    res.status(500).send(error?.message);
  }
  next(error);
}

module.exports = { errorHandlingMiddleWare };
