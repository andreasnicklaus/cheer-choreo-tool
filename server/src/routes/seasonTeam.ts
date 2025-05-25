import { NextFunction, Response, Request, Router } from "express";
import SeasonTeam from "../db/models/seasonTeam";
import Member from "../db/models/member";
import SeasonTeamService from "../services/SeasonTeamService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /seasonTeam/:
 *   post:
 *     description: Create a new season-team association
 *     tags:
 *       - SeasonTeams
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
 *               memberIds:
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
 */
router.post("/", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  const { teamId, seasonId, memberIds = [] } = req.body;
  return SeasonTeamService.create(teamId, seasonId, memberIds, req.UserId)
    .then((seasonTeam: SeasonTeam | null) => {
      res.send(seasonTeam);
      return next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /seasonTeam/{id}:
 *   put:
 *     description: Copy members into a season team
 *     tags:
 *       - SeasonTeams
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
 *               memberIds:
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
 */
router.put("/:id", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  const { memberIds } = req.body;
  return SeasonTeamService.copyMembersIntoSeasonTeam(
    req.params.id,
    memberIds,
    req.UserId
  )
    .then((memberList: Member[]) => {
      res.send(memberList);
      next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /seasonTeam/{id}:
 *   delete:
 *     description: Delete a season team by ID
 *     tags:
 *       - SeasonTeams
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SeasonTeam deleted successfully
 */
router.delete("/:id", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  return SeasonTeamService.remove(req.params.id, req.UserId)
    .then(() => {
      res.send();
      return next();
    })
    .catch((e: Error) => next(e));
});

export { router as seasonTeamRouter };
