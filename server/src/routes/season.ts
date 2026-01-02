import { NextFunction, Response, Request, Router } from "express";
import Season from "../db/models/season";
import SeasonService from "../services/SeasonService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /season/:
 *   get:
 *     description: Get all seasons for the current user
 *     tags:
 *       - Seasons
 *     security:
 *       - userAuthentication: []
 *     responses:
 *       200:
 *         description: List of seasons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Season'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    return SeasonService.getAll(req.UserId)
      .then((seasonList: Season[]) => {
        res.send(seasonList);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /season/:
 *   post:
 *     description: Create a new season
 *     tags:
 *       - Seasons
 *     security:
 *       - userAuthentication: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Season created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Season'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { name, year } = req.body;
    return SeasonService.create(name, year, req.UserId)
      .then((season: Season) => {
        res.send(season);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as seasonRouter };
