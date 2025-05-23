const { Router } = require("express");
const PositionService = require("../services/PositionService");
const LineupService = require("../services/LineupService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /lineup/:
 *   post:
 *     description: Create a new lineup
 *     tags:
 *       - Lineups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startCount
 *               - endCount
 *               - choreoId
 *             properties:
 *               startCount:
 *                 type: integer
 *               endCount:
 *                 type: integer
 *               choreoId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lineup created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lineup'
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { startCount, endCount, choreoId } = req.body;
  LineupService.create(startCount, endCount, choreoId, req.UserId)
    .then((lineup) => {
      res.send(lineup);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /lineup/{id}:
 *   put:
 *     description: Update a lineup by ID
 *     tags:
 *       - Lineups
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
 *             $ref: '#/components/schemas/Lineup'
 *     responses:
 *       200:
 *         description: Lineup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lineup'
 *       404:
 *         description: Lineup not found
 */
router.put("/:id", authenticateUser(), (req, res, next) => {
  LineupService.update(req.params.id, req.body, req.UserId)
    .then((lineup) => {
      res.send(lineup);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /lineup/{id}/position:
 *   post:
 *     description: Add a position to a lineup
 *     tags:
 *       - Lineups
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
 *               - x
 *               - y
 *               - memberId
 *             properties:
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               memberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Position added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 */
router.post("/:id/position", authenticateUser(), (req, res, next) => {
  const { x, y, memberId } = req.body;
  PositionService.create(x, y, req.UserId)
    .then(async (position) => {
      return Promise.all([
        position.setMember(memberId),
        LineupService.findById(req.params.id, req.UserId).then((lineup) =>
          lineup.addPosition(position)
        ),
      ]).then(() =>
        PositionService.findById(position.id, req.UserId).then((p) => {
          res.send(p);
          next();
        })
      );
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /lineup/{id}/position/{positionId}:
 *   put:
 *     description: Update a position in a lineup
 *     tags:
 *       - Lineups
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: positionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       200:
 *         description: Position updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *       404:
 *         description: Position not found
 */
router.put(
  "/:id/position/:positionId",
  authenticateUser(),
  (req, res, next) => {
    PositionService.update(
      req.params.positionId,
      req.params.id,
      req.body,
      req.UserId
    )
      .then((position) => {
        res.send(position);
        next();
      })
      .catch((e) => next(e));
  }
);

/**
 * @openapi
 * /lineup/{id}:
 *   delete:
 *     description: Delete a lineup by ID
 *     tags:
 *       - Lineups
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lineup deleted successfully
 *       404:
 *         description: Lineup not found
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  LineupService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { lineupRouter: router };
