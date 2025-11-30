import { NextFunction, Request, Response } from "express";
import logger from "../plugins/winston";

/**
 * Middleware to log every incoming request
 * @param {Request} req Incoming request object
 * @param {Response} res Outgoing response object
 * @param {Function} next Next handler function
 */
export function loggerMiddleWare(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.path == "/health") return next();
  if (!req.body) req.body = {}
  const { password = null, ...requestBody } = req.body;

  logger.info(
    `${req.method} ${req.url} ; Referrer: ${req.get("Referrer") || null
    } ; Body: ${JSON.stringify(requestBody)};`,
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
export function errorLoggingMiddleWare(
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  // Log the error message at the error level
  logger.error(`${err.name}: ${err.message || "No error message provided"}`);
  next(err);
}
