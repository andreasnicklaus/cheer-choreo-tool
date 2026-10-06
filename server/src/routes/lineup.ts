import { NextFunction, Response, Request, Router } from "express";
import { z } from "zod";
import Lineup from "../db/models/lineup";
import Position from "../db/models/position";
import LineupService from "../services/LineupService";
import PositionService from "../services/PositionService";
import { requestQueue } from "@/middlewares/requestQueue";
import { validate } from "@/middlewares/validateMiddleware";
import { uuidParams } from "@/utils/zodSchemas";

const { default: AuthService } = require("../services/AuthService");

const createLineupSchema = z.object({
  startCount: z.number().int(),
  endCount: z.number().int(),
  choreoId: z.uuid(),
});
// Strict so that unknown keys (notably `choreoId`) are rejected with a 400
// instead of silently being stripped: a lineup cannot be moved to another
// choreography. LineupService.update re-checks this for non-HTTP callers.
const updateLineupSchema = z
  .object({
    startCount: z.number().int(),
    endCount: z.number().int(),
  })
  .strict();

const lineupPositionParams = z.object({
  id: z.uuid(),
  positionId: z.uuid(),
});

const addPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  MemberId: z.uuid(),
  timeOfManualUpdate: z.string().optional(),
});
const updatePositionSchema = addPositionSchema.partial();

type CreateLineupBody = z.infer<typeof createLineupSchema>;
type UpdateLineupBody = z.infer<typeof updateLineupSchema>;
type AddPositionBody = z.infer<typeof addPositionSchema>;
type LineupPositionParams = z.infer<typeof lineupPositionParams>;

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
 *       409:
 *         description: The lineup overlaps another lineup of the same choreo, or
 *           a member already holds a position in an overlapping lineup
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Lineup consistency conflict introduced: lineupOverlap:..."
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  validate(createLineupSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { startCount, endCount, choreoId } = req.body as CreateLineupBody;
    LineupService.create(startCount, endCount, choreoId, req.actingUserId)
      .then((lineup: Lineup) => {
        res.send(lineup);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /lineup/{id}:
 *   put:
 *     description: |
 *       Update a lineup by ID. Only `startCount` and `endCount` can be changed:
 *       a lineup cannot be moved to another choreo and its owner cannot be
 *       reassigned.
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
 *             properties:
 *               startCount:
 *                 type: integer
 *               endCount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lineup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lineup'
 *       400:
 *         description: The update tried to move the lineup to another choreo
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Lineups cannot be moved to another choreography
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Lineup not found
 *       409:
 *         description: The new count range overlaps another lineup of the same
 *           choreo, or a member already holds a position in an overlapping lineup
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Lineup consistency conflict introduced: lineupOverlap:..."
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(updateLineupSchema),
  (req: Request, res: Response, next: NextFunction) => {
    LineupService.update(
      req.params.id,
      req.body as UpdateLineupBody,
      req.actingUserId,
    )
      .then((lineup: Lineup | null) => {
        res.send(lineup);
        return next();
      })
      .catch((e: Error) => next(e));
  },
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
 *               timeOfManualUpdate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional timestamp for manual update tracking
 *     responses:
 *       200:
 *         description: Position added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: The placement would put the member in two overlapping
 *           lineups of the same choreo
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Lineup consistency conflict introduced: memberConflict:..."
 */
router.post(
  "/:id/position",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(addPositionSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { x, y, MemberId, timeOfManualUpdate } = req.body as AddPositionBody;
    PositionService.create(
      x,
      y,
      req.params.id,
      MemberId,
      req.actingUserId,
      false,
      timeOfManualUpdate ? new Date(timeOfManualUpdate) : new Date(),
    )
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
  validate(lineupPositionParams, "params"),
  validate(updatePositionSchema),
  requestQueue("positionUpdate"),
  (req: Request, res: Response, next: NextFunction) => {
    const params = req.params as LineupPositionParams;
    PositionService.update(
      params.positionId,
      params.id,
      req.body,
      req.actingUserId,
    )
      .then((position: Position) => {
        res.send(position);
        next();
      })
      .catch((e: Error) => next(e));
  },
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
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    LineupService.remove(req.params.id, req.actingUserId)
      .then(() => {
        res.send();
        next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as lineupRouter };
