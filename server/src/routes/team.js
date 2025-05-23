const { Router } = require("express");
const TeamService = require("../services/TeamService");
const { authenticateUser } = require("../services/AuthService");
const NotificationService = require("../services/NotificationService");

const router = Router();

/**
 * @openapi
 * /team/{id}:
 *   get:
 *     description: Get a specific team by ID, or all teams if no ID is provided. Optionally filter by name.
 *     tags:
 *       - Teams
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
 *       404:
 *         description: Team not found
 */
router.get("/:id?", authenticateUser(), (req, res, next) => {
  if (req.params.id)
    return TeamService.findById(req.params.id, req.UserId)
      .then((team) => {
        res.send(team);
        return next();
      })
      .catch((e) => {
        next(e);
      });
  else {
    if (req.query.name)
      return TeamService.findByName(req.query.name, req.UserId)
        .then((foundTeam) => {
          if (!foundTeam) res.status(404).send(req.t("responses.not-found"));
          else res.send(foundTeam);
          return next();
        })
        .catch((e) => next(e));
    else
      return TeamService.getAll(req.UserId)
        .then((foundTeams) => {
          res.send(foundTeams);
          return next();
        })
        .catch((e) => next(e));
  }
});

/**
 * @openapi
 * /team/:
 *   post:
 *     description: Create a new team
 *     tags:
 *       - Teams
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
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { name, clubId, seasonId } = req.body;
  return TeamService.create(name, clubId, seasonId, req.UserId)
    .then((result) => {
      NotificationService.createOne(
        req.t("notifications.team-created.title"),
        req.t("notifications.team-created.message", {
          name,
          teamId: result.id,
        }),
        req.UserId
      );
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /team/{id}:
 *   put:
 *     description: Update a team by ID
 *     tags:
 *       - Teams
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
 *       404:
 *         description: Team not found
 */
router.put("/:id", authenticateUser(), (req, res, next) => {
  return TeamService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /team/{id}:
 *   delete:
 *     description: Delete a team by ID
 *     tags:
 *       - Teams
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       404:
 *         description: Team not found
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  return TeamService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { teamRouter: router };
