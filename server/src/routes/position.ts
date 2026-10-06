import { NextFunction, Response, Request, Router } from "express";
import { z } from "zod";
import Position from "../db/models/position";
import PositionService from "../services/PositionService";
import { requestQueue } from "@/middlewares/requestQueue";
import { validate } from "@/middlewares/validateMiddleware";
import { uuidParams } from "@/utils/zodSchemas";

const { default: AuthService } = require("../services/AuthService");

const positionQuerySchema = z.object({
  lineupId: z.uuid().optional(),
});

const createPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  MemberId: z.uuid(),
  lineupId: z.uuid(),
});
const updatePositionSchema = createPositionSchema.partial();

type PositionQuery = z.infer<typeof positionQuerySchema>;
type CreatePositionBody = z.infer<typeof createPositionSchema>;

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
  validate(positionQuerySchema, "query"),
  (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as PositionQuery;
    if (query.lineupId)
      PositionService.findByLineupId(
        query.lineupId,
        req.ownerIds,
        req.actingUserId,
      )
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
 *       409:
 *         description: A different position already occupies this member slot in
 *           the lineup, or the placement conflicts with an overlapping lineup
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Lineup consistency conflict introduced: duplicatePosition:..."
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  validate(createPositionSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { x, y, MemberId, lineupId } = req.body as CreatePositionBody;

    PositionService.findOrCreate(x, y, lineupId, MemberId, req.actingUserId)
      .then((position: Position) =>
        PositionService.findById(position.id, req.actingUserId).then(
          (p: Position | null) => {
            res.send(p);
            next();
          },
        ),
      )
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
 *       400:
 *         description: The update tried to move the position to another lineup
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Positions cannot be moved to another lineup
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Position not found
 *       409:
 *         description: The member reassignment would place the member in two
 *           overlapping lineups of the same choreo
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Lineup consistency conflict introduced: memberConflict:..."
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(updatePositionSchema),
  requestQueue("positionUpdate"),
  (req: Request, res: Response, next: NextFunction) => {
    PositionService.update(req.params.id, null, req.body, req.actingUserId)
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
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    PositionService.remove(req.params.id, req.actingUserId)
      .then(() => {
        res.send();
        next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as positionRouter };
