const { Router } = require("express");
const MemberService = require("../services/MemberService");
const { authenticateUser } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /member/:
 *   post:
 *     description: Create a new member
 *     tags:
 *       - Members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - seasonTeamId
 *             properties:
 *               name:
 *                 type: string
 *               nickname:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               seasonTeamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { name, nickname, abbreviation, seasonTeamId } = req.body;
  MemberService.create(name, nickname, abbreviation, seasonTeamId, req.UserId)
    .then((member) => {
      res.send(member);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /member/{id}:
 *   put:
 *     description: Update a member by ID
 *     tags:
 *       - Members
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
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       404:
 *         description: Member not found
 */
router.put("/:id", authenticateUser(), (req, res, next) => {
  MemberService.update(req.params.id, req.body, req.UserId)
    .then((member) => {
      res.send(member);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /member/{id}:
 *   delete:
 *     description: Delete a member by ID
 *     tags:
 *       - Members
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       404:
 *         description: Member not found
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  MemberService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
});

module.exports = { memberRouter: router };
