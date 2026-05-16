import { NextFunction, Response, Request, Router } from "express";
import { z } from "zod";
import Hit from "../db/models/hit";
import HitService from "../services/HitService";
import { NotFoundError } from "@/utils/errors";
import { validate } from "@/middlewares/validateMiddleware";
import { uuidParams, uuidParamsOptional } from "@/utils/zodSchemas";

const { default: AuthService } = require("../services/AuthService");

const createHitSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(0),
  choreoId: z.uuid(),
  MemberIds: z.array(z.uuid()).optional().default([]),
});
const updateHitSchema = createHitSchema.partial();

type CreateHitBody = z.infer<typeof createHitSchema>;
type UpdateHitBody = z.infer<typeof updateHitSchema>;

const router = Router();

/**
 * @openapi
 * /hit/{id}:
 *   get:
 *     description: Get a specific hit by ID, or all hits if no ID is provided
 *     tags:
 *       - Hits
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hit(s) found
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Hit'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Hit not found
 */
router.get(
  "/{:id}",
  AuthService.authenticateUser(),
  validate(uuidParamsOptional, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id)
      return HitService.findById(req.params.id, req.actingUserId)
        .then((foundHit: Hit | null) => {
          if (!foundHit) throw new NotFoundError();
          else res.send(foundHit);
          return next();
        })
        .catch((e: Error) => next(e));
    else {
      return HitService.getAll(req.ownerIds, req.actingUserId)
        .then((hitList: Hit[]) => {
          res.send(hitList);
          return next();
        })
        .catch((e: Error) => next(e));
    }
  },
);

/**
 * @openapi
 * /hit/:
 *   post:
 *     description: Create a new hit
 *     tags:
 *       - Hits
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
 *               - count
 *               - choreoId
 *             properties:
 *               name:
 *                 type: string
 *               count:
 *                 type: integer
 *               choreoId:
 *                 type: string
 *               MemberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Hit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  validate(createHitSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { name, count, choreoId, MemberIds = [] } = req.body as CreateHitBody;
    return HitService.create(name, count, choreoId, MemberIds, req.actingUserId)
      .then((hit: Hit | null) => {
        res.send(hit);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /hit/{id}:
 *   put:
 *     description: Update a hit by ID
 *     tags:
 *       - Hits
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
 *             $ref: '#/components/schemas/Hit'
 *     responses:
 *       200:
 *         description: Hit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Hit not found
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(updateHitSchema),
  (req: Request, res: Response, next: NextFunction) => {
    return HitService.update(
      req.params.id,
      req.body as UpdateHitBody,
      req.actingUserId,
    )
      .then((hit: Hit | null) => {
        res.send(hit);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /hit/{id}:
 *   delete:
 *     description: Delete a hit by ID
 *     tags:
 *       - Hits
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
 *         description: Hit deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Hit not found
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    return HitService.remove(req.params.id, req.actingUserId)
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as hitRouter };
