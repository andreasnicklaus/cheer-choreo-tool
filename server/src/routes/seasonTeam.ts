import { NextFunction, Response, Request, Router } from "express";
import { z } from "zod";
import SeasonTeam from "../db/models/seasonTeam";
import SeasonTeamService from "../services/SeasonTeamService";
import { validate } from "@/middlewares/validateMiddleware";
import { uuidParams } from "@/utils/zodSchemas";

const { default: AuthService } = require("../services/AuthService");

const createSeasonTeamSchema = z.object({
  teamId: z.uuid(),
  seasonId: z.uuid(),
  MemberIds: z.array(z.uuid()).optional().default([]),
});
const copyMembersSchema = z.object({
  MemberIds: z.array(z.uuid()),
});

type CreateSeasonTeamBody = z.infer<typeof createSeasonTeamSchema>;
type CopyMembersBody = z.infer<typeof copyMembersSchema>;

const router = Router();

/**
 * @openapi
 * /seasonTeam/:
 *   post:
 *     description: Create a new season-team association
 *     tags:
 *       - SeasonTeams
 *     security:
 *       - userAuthentication: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - seasonId
 *             properties:
 *               teamId:
 *                 type: string
 *               seasonId:
 *                 type: string
 *               MemberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: SeasonTeam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeasonTeam'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  validate(createSeasonTeamSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { teamId, seasonId, MemberIds = [] } = req.body as CreateSeasonTeamBody;
    return SeasonTeamService.create(
      teamId,
      seasonId,
      MemberIds,
      req.actingUserId,
    )
      .then((seasonTeam: SeasonTeam | null) => {
        res.send(seasonTeam);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /seasonTeam/{id}:
 *   put:
 *     description: Copy members into a season team
 *     tags:
 *       - SeasonTeams
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
 *               MemberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members copied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  validate(copyMembersSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { MemberIds } = req.body as CopyMembersBody;
    return SeasonTeamService.copyMembersIntoSeasonTeam(
      req.params.id,
      MemberIds,
      req.actingUserId,
    )
      .then((memberList) => {
        res.send(memberList);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /seasonTeam/{id}:
 *   delete:
 *     description: Delete a season team by ID
 *     tags:
 *       - SeasonTeams
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
 *         description: SeasonTeam deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  validate(uuidParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    return SeasonTeamService.remove(req.params.id, req.actingUserId)
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as seasonTeamRouter };
