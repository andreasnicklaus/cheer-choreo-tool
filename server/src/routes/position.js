const { Router } = require("express");
const PositionService = require("../services/PositionService");
const { authenticateUser } = require("../services/AuthService");
const LineupService = require("../services/LineupService");

const router = Router();

/**
 * @openapi
 * /position/:
 *   get:
 *     description: Get all positions for a lineup (by lineupId query param)
 *     tags:
 *       - Positions
 *     parameters:
 *       - name: lineupId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of positions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Position'
 */
router.get("/", authenticateUser(), (req, res, next) => {
  if (req.query.lineupId)
    PositionService.findByLineupId(req.query.lineupId, req.UserId)
      .then((foundPositions) => {
        res.send(foundPositions);
        return next();
      })
      .catch((e) => next(e));
});

/**
 * @openapi
 * /position/:
 *   post:
 *     description: Create a new position
 *     tags:
 *       - Positions
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
 *               - lineupId
 *             properties:
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               memberId:
 *                 type: string
 *               lineupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Position created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { x, y, memberId, lineupId } = req.body;

  PositionService.findOrCreate(x, y, lineupId, memberId, req.UserId)
    .then(async (position) => {
      return Promise.all([
        position.setMember(memberId),
        LineupService.findById(lineupId, req.UserId).then((lineup) =>
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
 * /position/{id}:
 *   put:
 *     description: Update a position by ID
 *     tags:
 *       - Positions
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json
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
router.put("/:id", authenticateUser(), (req, res, next) => {
  PositionService.update(req.params.id, req.body, req.UserId)
    .then((position) => {
      res.send(position);
      next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /position/{id}:
 *   delete:
 *     description: Delete a position by ID
 *     tags:
 *       - Positions
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Position deleted successfully
 *       404:
 *         description: Position not found
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  PositionService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { positionRouter: router };
