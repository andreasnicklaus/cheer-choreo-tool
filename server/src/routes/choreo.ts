import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import Choreo from "../db/models/choreo";
import ChoreoService from "../services/ChoreoService";
import { NotFoundError } from "@/utils/errors";
import { validate } from "@/middlewares/validateMiddleware";
import { colorHex, uuidParams, uuidParamsOptional } from "@/utils/zodSchemas";

const { default: AuthService } = require("../services/AuthService");

const createChoreoSchema = z.object({
  name: z.string().min(1),
  counts: z.number().int().min(0),
  matType: z.string().min(1),
  seasonTeamId: z.uuid(),
  participants: z.array(z.object({ id: z.uuid(), color: colorHex.optional() })).optional().default([]),
  ownerId: z.uuid().optional(),
});
const updateChoreoSchema = createChoreoSchema.partial();

const choreoParticipationParams = z.object({
  id: z.uuid(),
  participationId: z.uuid(),
});
const choreoParticipantParams = z.object({
  id: z.uuid(),
  participantId: z.uuid(),
});

const addParticipantSchema = z.object({
  MemberId: z.uuid(),
  color: colorHex.optional(),
});

const replaceParticipantSchema = z.object({
  memberToRemoveId: z.uuid(),
  memberToAddId: z.uuid(),
});

const changeColorSchema = z.object({
  color: colorHex,
});

type CreateChoreoBody = z.infer<typeof createChoreoSchema>;
type UpdateChoreoBody = z.infer<typeof updateChoreoSchema>;
type AddParticipantBody = z.infer<typeof addParticipantSchema>;
type ReplaceParticipantBody = z.infer<typeof replaceParticipantSchema>;
type ChangeColorBody = z.infer<typeof changeColorSchema>;
type ChoreoParticipationParams = z.infer<typeof choreoParticipationParams>;
type ChoreoParticipantParams = z.infer<typeof choreoParticipantParams>;

/**
 * @swagger
 * tags:
 * - name: Choreos
 */

/** @ignore */
const router = Router();

/**
 * @openapi
 * /choreo/{id}:
 *  get:
 *    description: Get a list of choreos or a specific choreo
 *    tags:
 *    - Choreos
 *    security:
 *      - userAuthentication: []
 *    parameters:
 *    - name: id
 *      in: path
 *      required: false
 *      schema:
 *        type: string
 *        format: uuid
 *    responses:
 *      200:
 *        description: Either a list of choreos if id was not defined or a specific choreo otherwise
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *              - $ref: '#/components/schemas/Choreo'
 *              - type: array
 *                items:
 *                  $ref: '#/components/schemas/Choreo'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: Choreo was not found
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: Not found
 */
router.get(
  "/{:id}",
  AuthService.authenticateUser(),
  validate(uuidParamsOptional, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id)
      ChoreoService.findById(req.params.id, req.actingUserId)
        .then((foundChoreo: Choreo | null) => {
          if (!foundChoreo) throw new NotFoundError();
          else res.send(foundChoreo);
          return next();
        })
        .catch((e: Error) => next(e));
    else {
      ChoreoService.getAll(req.ownerIds, req.actingUserId)
        .then((choreoList: Choreo[]) => {
          res.send(choreoList);
          return next();
        })
        .catch((e: Error) => next(e));
    }
  },
);

/**
 * @openapi
 * /choreo/:
 *   post:
 *     description: Create a new choreo
 *     tags:
 *       - Choreos
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
 *               - counts
 *               - matType
 *               - seasonTeamId
 *             properties:
 *               name:
 *                 type: string
 *               counts:
 *                 type: integer
 *               matType:
 *                 type: string
 *               seasonTeamId:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               ownerId:
 *                 type: string | null
 *                 description: Owner ID. If null/undefined, falls back to actingUserId
 *     responses:
 *       200:
 *         description: Choreo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Choreo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  validate(createChoreoSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { name, counts, matType, seasonTeamId, participants, ownerId } =
      req.body as CreateChoreoBody;
    return ChoreoService.create(
      name,
      counts,
      matType as Choreo["matType"],
      seasonTeamId,
      participants,
      ownerId || req.actingUserId,
      req.actingUserId,
    )
      .then((choreo: Choreo | null) => {
        res.send(choreo);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /choreo/{id}:
 *   put:
 *     description: Update a choreo by ID
 *     tags:
 *       - Choreos
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
 *             $ref: '#/components/schemas/Choreo'
 *     responses:
 *       200:
 *         description: Choreo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Choreo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Choreo not found
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(updateChoreoSchema),
  (req: Request, res: Response, next: NextFunction) => {
    return ChoreoService.update(req.params.id, req.body as UpdateChoreoBody, req.actingUserId)
      .then((choreo: Choreo | null) => {
        res.send(choreo);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /choreo/{id}:
 *   delete:
 *     description: Delete a choreo by ID
 *     tags:
 *       - Choreos
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
 *         description: Choreo deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Choreo not found
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    return ChoreoService.remove(req.params.id, req.actingUserId)
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /choreo/{id}/participants:
 *   post:
 *     description: Add a participant to a choreo
 *     tags:
 *       - Choreos
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
 *               - MemberId
 *             properties:
 *               MemberId:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant added successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/:id/participants",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(addParticipantSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { MemberId, color } = req.body as AddParticipantBody;
    return ChoreoService.addParticipant(
      req.params.id,
      MemberId,
      req.actingUserId,
      false,
      color,
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /choreo/{id}/participants/{participationId}:
 *   delete:
 *     description: Remove a participant from a choreo
 *     tags:
 *       - Choreos
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: participationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant removed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  "/:id/participants/:participationId",
  AuthService.authenticateUser(),
  validate(choreoParticipationParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    const params = req.params as ChoreoParticipationParams;
    return ChoreoService.removeParticipant(
      params.id,
      params.participationId,
      req.actingUserId,
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /choreo/{id}/participants:
 *   patch:
 *     description: Replace a participant in a choreo
 *     tags:
 *       - Choreos
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
 *               - memberToRemoveId
 *               - memberToAddId
 *             properties:
 *               memberToRemoveId:
 *                 type: string
 *               memberToAddId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Choreo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch(
  "/:id/participants",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(replaceParticipantSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { memberToRemoveId, memberToAddId } = req.body as ReplaceParticipantBody;
    return ChoreoService.replaceParticipant(
      req.params.id,
      memberToAddId,
      memberToRemoveId,
      req.actingUserId,
    )
      .then((choreo: Choreo | null) => {
        res.send(choreo);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /choreo/{id}/participants/{participantId}:
 *   patch:
 *     description: Change the color of a participant in a choreo
 *     tags:
 *       - Choreos
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: participantId
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
 *               - color
 *             properties:
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Color changed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch(
  "/:id/participants/:participantId",
  AuthService.authenticateUser(),
  validate(choreoParticipantParams, "params"),
  validate(changeColorSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { color } = req.body as ChangeColorBody;
    const params = req.params as ChoreoParticipantParams;
    return ChoreoService.changeParticipationColor(
      params.id,
      params.participantId,
      color,
      req.actingUserId,
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as choreoRouter };
