import { NextFunction, Request, Response, Router } from "express";
import Choreo from "../db/models/choreo";
import ChoreoService from "../services/ChoreoService";
const { default: AuthService } = require("../services/AuthService");

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
  "/:id?",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id)
      ChoreoService.findById(req.params.id, req.UserId)
        .then((foundChoreo: Choreo) => {
          if (!foundChoreo) res.status(404).send(req.t("responses.not-found"));
          else res.send(foundChoreo);
          return next();
        })
        .catch((e: Error) => next(e));
    else {
      ChoreoService.getAll(req.UserId)
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
  (req: Request, res: Response, next: NextFunction) => {
    const { name, counts, matType, seasonTeamId, participants } = req.body;
    return ChoreoService.create(
      name,
      counts,
      matType,
      seasonTeamId,
      participants,
      req.UserId,
    )
      .then((choreo: Choreo) => {
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
  (req: Request, res: Response, next: NextFunction) => {
    return ChoreoService.update(req.params.id, req.body, req.UserId)
      .then((choreo: Choreo) => {
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
  (req: Request, res: Response, next: NextFunction) => {
    return ChoreoService.remove(req.params.id, req.UserId)
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
  (req: Request, res: Response, next: NextFunction) => {
    const { MemberId, color } = req.body;
    return ChoreoService.addParticipant(
      req.params.id,
      MemberId,
      req.UserId,
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
  (req: Request, res: Response, next: NextFunction) => {
    return ChoreoService.removeParticipant(
      req.params.id,
      req.params.participationId,
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
  (req: Request, res: Response, next: NextFunction) => {
    const { memberToRemoveId, memberToAddId } = req.body;
    return ChoreoService.replaceParticipant(
      req.params.id,
      memberToAddId,
      memberToRemoveId,
      req.UserId,
    )
      .then((choreo: Choreo) => {
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
  (req: Request, res: Response, next: NextFunction) => {
    const { color } = req.body;
    return ChoreoService.changeParticipationColor(
      req.params.id,
      req.params.participantId,
      color,
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as choreoRouter };
