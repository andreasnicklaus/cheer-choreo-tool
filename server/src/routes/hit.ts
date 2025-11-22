import { NextFunction, Response, Request, Router } from "express";
import Hit from "../db/models/hit";
import HitService from "../services/HitService";

const { default: AuthService } = require("../services/AuthService");

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
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id)
      return HitService.findById(req.params.id, req.UserId)
        .then((foundHit: Hit | null) => {
          if (!foundHit) res.status(404).send(req.t("responses.not-found"));
          else res.send(foundHit);
          return next();
        })
        .catch((e: Error) => next(e));
    else {
      return HitService.getAll(req.UserId)
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
 *               memberIds:
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
  (req: Request, res: Response, next: NextFunction) => {
    const { name, count, choreoId, memberIds = [] } = req.body;
    return HitService.create(name, count, choreoId, memberIds, req.UserId)
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
  (req: Request, res: Response, next: NextFunction) => {
    return HitService.update(req.params.id, req.body, req.UserId)
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
  (req: Request, res: Response, next: NextFunction) => {
    return HitService.remove(req.params.id, req.UserId)
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as hitRouter };
