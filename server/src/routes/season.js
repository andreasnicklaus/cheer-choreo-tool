const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const SeasonService = require("../services/SeasonService");

const router = Router();

/**
 * @openapi
 * /season/:
 *   get:
 *     description: Get all seasons for the current user
 *     tags:
 *       - Seasons
 *     responses:
 *       200:
 *         description: List of seasons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Season'
 */
router.get("/", authenticateUser(), (req, res, next) => {
  return SeasonService.getAll(req.UserId)
    .then((seasonList) => {
      res.send(seasonList);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /season/:
 *   post:
 *     description: Create a new season
 *     tags:
 *       - Seasons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Season created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Season'
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { name, year } = req.body;
  return SeasonService.create(name, year, req.UserId)
    .then((season) => {
      res.send(season);
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { seasonRouter: router };
