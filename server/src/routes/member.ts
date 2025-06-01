import { NextFunction, Response, Request, Router } from "express";
import Member from "../db/models/member";
import MemberService from "../services/MemberService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /member/:
 *   post:
 *     description: Create a new member
 *     tags:
 *       - Members
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  const { name, nickname, abbreviation, seasonTeamId } = req.body;
  MemberService.create(name, nickname, abbreviation, seasonTeamId, req.UserId)
    .then((member: Member) => {
      res.send(member);
      return next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /member/{id}:
 *   put:
 *     description: Update a member by ID
 *     tags:
 *       - Members
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
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Member not found
 */
router.put("/:id", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  MemberService.update(req.params.id, req.body, req.UserId)
    .then((member: Member | null) => {
      res.send(member);
      return next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /member/{id}:
 *   delete:
 *     description: Delete a member by ID
 *     tags:
 *       - Members
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
 *         description: Member deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Member not found
 */
router.delete("/:id", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  MemberService.remove(req.params.id, req.UserId)
    .then(() => {
      res.send();
      next();
    })
    .catch((e: Error) => next(e));
});

export { router as memberRouter };
