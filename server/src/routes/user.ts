import { NextFunction, Response, Request, Router } from "express";
import User from "../db/models/user";
import UserService from "../services/UserService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /user/:
 *   put:
 *     description: Update the current user's information
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put("/", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  UserService.update(req.UserId, req.body)
    .then((user: User | null) => {
      res.send(user);
      next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /user/:
 *   delete:
 *     description: Delete the current user's account
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  UserService.remove(req.UserId)
    .then(() => {
      res.send();
      next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /user/revokeEmail/{id}:
 *   get:
 *     description: Revoke a user's email address (renders a status page)
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email revoked (renders a page)
 */
router.get("/revokeEmail/:id", (req: Request, res: Response, next: NextFunction) => {
  UserService.remove(req.params.id)
    .then(() => {
      res.render("../src/views/emailRevoked.ejs", {
        frontendDomain: process.env.FRONTEND_DOMAIN,
      }); // njsscan-ignore: express_lfr_warning
      next();
    })
    .catch((e: Error) => {
      res.render("../src/views/error.ejs", {
        action: "email-revocation",
        data: JSON.stringify({ userId: req.params.id }),
        error: e,
        timestamp: new Date().toLocaleString(req.locale),
      }); // njsscan-ignore: express_lfr_warning
    });
});

/**
 * @openapi
 * /user/confirmEmail/{id}:
 *   get:
 *     description: Confirm a user's email address (renders a status page)
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email confirmed (renders a page)
 */
router.get("/confirmEmail/:id", (req: Request, res: Response, next: NextFunction) => {
  UserService.update(req.params.id, { emailConfirmed: true })
    .then((_user: User | null) => {
      res.render("../src/views/emailConfirmed.ejs", {
        frontendDomain: process.env.FRONTEND_DOMAIN,
      }); // njsscan-ignore: express_lfr_warning
      next();
    })
    .catch((e: Error) => {
      res.render("../src/views/error.ejs", {
        action: "email-confirmation",
        data: JSON.stringify({ userId: req.params.id }),
        error: e,
        timestamp: new Date().toLocaleString(req.locale),
      }); // njsscan-ignore: express_lfr_warning
    });
});

export default { userRouter: router };
