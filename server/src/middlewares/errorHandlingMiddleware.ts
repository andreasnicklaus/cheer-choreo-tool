import {
  AuthorizationError,
  FaultyInputError,
  NotFoundError,
  RequestOrderError,
} from "@/utils/errors";
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
    if (error instanceof RequestOrderError) res.status(409).send(error.message);
    else if (error instanceof NotFoundError)
      res
        .status(404)
        .send(
          `${req.t("responses.not-found")}${error.message ? `: ${error.message}` : ""}`,
        );
    else if (error instanceof FaultyInputError)
      res.status(400).send(error.message);
    else if (error instanceof AuthorizationError)
      res
        .status(401)
        .send(`Unauthorized${error.message ? `: ${error.message}` : ""}`);
    else
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
