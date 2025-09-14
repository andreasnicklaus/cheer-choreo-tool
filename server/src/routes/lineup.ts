import { NextFunction, Response, Request, Router } from "express";
import Lineup from "../db/models/lineup";
import Position from "../db/models/position";
import LineupService from "../services/LineupService";
import PositionService from "../services/PositionService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /lineup/:
 *   post:
 *     description: Create a new lineup
 *     tags:
 *       - Lineups
 *     security:
 *       - userAuthentication: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startCount
 *               - endCount
 *               - choreoId
 *             properties:
 *               startCount:
 *                 type: integer
 *               endCount:
 *                 type: integer
 *               choreoId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lineup created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lineup'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { startCount, endCount, choreoId } = req.body;
    LineupService.create(startCount, endCount, choreoId, req.UserId)
      .then((lineup: Lineup) => {
        res.send(lineup);
        return next();
      })
      .catch((e: Error) => next(e));
  }
);

/**
 * @openapi
 * /lineup/{id}:
 *   put:
 *     description: Update a lineup by ID
 *     tags:
 *       - Lineups
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lineup'
 *     responses:
 *       200:
 *         description: Lineup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lineup'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Lineup not found
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    LineupService.update(req.params.id, req.body, req.UserId)
      .then((lineup: Lineup | null) => {
        res.send(lineup);
        return next();
      })
      .catch((e: Error) => next(e));
  }
);

/**
 * @openapi
 * /lineup/{id}/position:
 *   post:
 *     description: Add a position to a lineup
 *     tags:
 *       - Lineups
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - x
 *               - y
 *               - MemberId
 *             properties:
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               MemberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Position added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/:id/position",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { x, y, MemberId } = req.body;
    PositionService.create(x, y, req.UserId)
      .then(async (position: Position) => {
        return Promise.all([
          position.setMember(MemberId),
          LineupService.findById(req.params.id, req.UserId).then(
            (lineup: Lineup | null) => lineup?.addPosition(position)
          ),
        ]).then(() =>
          PositionService.findById(position.id, req.UserId).then(
            (p: Position | null) => {
              res.send(p);
              next();
            }
          )
        );
      })
      .catch((e: Error) => next(e));
  }
);

/**
 * @openapi
 * /lineup/{id}/position/{positionId}:
 *   put:
 *     description: Update a position in a lineup
 *     tags:
 *       - Lineups
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: positionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       200:
 *         description: Position updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Position not found
 */
router.put(
  "/:id/position/:positionId",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    PositionService.update(
      req.params.positionId,
      req.params.id,
      req.body,
      req.UserId
    )
      .then((position: Position) => {
        res.send(position);
        next();
      })
      .catch((e: Error) => next(e));
  }
);

/**
 * @openapi
 * /lineup/{id}:
 *   delete:
 *     description: Delete a lineup by ID
 *     tags:
 *       - Lineups
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lineup deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Lineup not found
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    LineupService.remove(req.params.id, req.UserId)
      .then(() => {
        res.send();
        next();
      })
      .catch((e: Error) => next(e));
  }
);

export { router as lineupRouter };
