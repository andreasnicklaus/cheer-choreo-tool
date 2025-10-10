import { NextFunction, Response, Request, Router } from "express";
import Position from "../db/models/position";
import Lineup from "../db/models/lineup";
import PositionService from "../services/PositionService";
import LineupService from "../services/LineupService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /position/:
 *   get:
 *     description: Get all positions for a lineup (by lineupId query param)
 *     tags:
 *       - Positions
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: lineupId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of positions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Position'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.query.lineupId)
      PositionService.findByLineupId(req.query.lineupId as string, req.UserId)
        .then((foundPositions: Position[]) => {
          res.send(foundPositions);
          return next();
        })
        .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /position/:
 *   post:
 *     description: Create a new position
 *     tags:
 *       - Positions
 *     security:
 *       - userAuthentication: []
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
 *               - lineupId
 *             properties:
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               MemberId:
 *                 type: string
 *               lineupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Position created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { x, y, MemberId, lineupId } = req.body;

    PositionService.findOrCreate(x, y, lineupId, MemberId, req.UserId)
      .then(async (position: Position) => {
        return Promise.all([
          position.setMember(MemberId),
          LineupService.findById(lineupId, req.UserId).then(
            (lineup: Lineup | null) => lineup?.addPosition(position),
          ),
        ]).then(() =>
          PositionService.findById(position.id, req.UserId).then(
            (p: Position | null) => {
              res.send(p);
              next();
            },
          ),
        );
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /position/{id}:
 *   put:
 *     description: Update a position by ID
 *     tags:
 *       - Positions
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
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    PositionService.update(req.params.id, null, req.body, req.UserId)
      .then((position: Position) => {
        res.send(position);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /position/{id}:
 *   delete:
 *     description: Delete a position by ID
 *     tags:
 *       - Positions
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
 *         description: Position deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Position not found
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    PositionService.remove(req.params.id, req.UserId)
      .then(() => {
        res.send();
        next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as positionRouter };
