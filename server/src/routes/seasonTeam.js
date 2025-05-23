const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const SeasonTeamService = require("../services/SeasonTeamService");

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
router.post("/", authenticateUser(), (req, res, next) => {
  const { teamId, seasonId, memberIds = [] } = req.body;
  return SeasonTeamService.create(teamId, seasonId, memberIds, req.UserId)
    .then((seasonTeam) => {
      res.send(seasonTeam);
      return next();
    })
    .catch((e) => next(e));
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
router.put("/:id", authenticateUser(), (req, res, next) => {
  const { memberIds } = req.body;
  return SeasonTeamService.copyMembersIntoSeasonTeam(
    req.params.id,
    memberIds,
    req.UserId
  )
    .then((memberList) => {
      res.send(memberList);
      next();
    })
    .catch((e) => next(e));
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
router.delete("/:id", authenticateUser(), (req, res, next) => {
  return SeasonTeamService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { seasonTeamRouter: router };
