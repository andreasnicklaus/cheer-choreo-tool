import { NextFunction, Response, Request, Router } from "express";
import Team from "../db/models/team";
import TeamService from "../services/TeamService";
import NotificationService from "../services/NotificationService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /team/{id}:
 *   get:
 *     description: Get a specific team by ID, or all teams if no ID is provided. Optionally filter by name.
 *     tags:
 *       - Teams
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team(s) found
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Team not found
 */
router.get(
  "/:id?",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id)
      return TeamService.findById(req.params.id, req.UserId)
        .then((team: Team | null) => {
          res.send(team);
          return next();
        })
        .catch((e: Error) => next(e));
    else {
      if (req.query.name)
        return TeamService.findByName(req.query.name as string, req.UserId)
          .then((foundTeams: Team[]) => {
            if (!foundTeams) res.status(404).send(req.t("responses.not-found"));
            else res.send(foundTeams);
            return next();
          })
          .catch((e: Error) => next(e));
      else
        return TeamService.getAll(req.UserId)
          .then((foundTeams: Team[]) => {
            res.send(foundTeams);
            return next();
          })
          .catch((e: Error) => next(e));
    }
  },
);

/**
 * @openapi
 * /team/:
 *   post:
 *     description: Create a new team
 *     tags:
 *       - Teams
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
 *               - clubId
 *               - seasonId
 *             properties:
 *               name:
 *                 type: string
 *               clubId:
 *                 type: string
 *               seasonId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { name, clubId, seasonId } = req.body;
    return TeamService.create(name, clubId, seasonId, req.UserId)
      .then((team: Team | null) => {
        if (!team) throw new Error("Unknown error: Team could not be created");
        NotificationService.createOne(
          req.t("notifications.team-created.title"),
          req.t("notifications.team-created.message", {
            name,
            teamId: team.id,
          }),
          req.UserId,
        );
        res.send(team);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /team/{id}:
 *   put:
 *     description: Update a team by ID
 *     tags:
 *       - Teams
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
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Team not found
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    return TeamService.update(req.params.id, req.body, req.UserId)
      .then((team: Team) => {
        res.send(team);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /team/{id}:
 *   delete:
 *     description: Delete a team by ID
 *     tags:
 *       - Teams
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
 *         description: Team deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Team not found
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    return TeamService.remove(req.params.id, req.UserId)
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as teamRouter };
