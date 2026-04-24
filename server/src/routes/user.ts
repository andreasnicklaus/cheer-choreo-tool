import { NextFunction, Response, Request, Router } from "express";
import User from "../db/models/user";
import UserService from "../services/UserService";
import UserAccessService from "../services/UserAccessService";

const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /user/:
 *   put:
 *     description: Update the current user's information
 *     tags:
 *       - Users
 *     security:
 *       - userAuthentication: []
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
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.update(req.UserId, req.body)
      .then((user: User | null) => {
        res.send(user);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/:
 *   delete:
 *     description: Delete the current user's account
 *     tags:
 *       - Users
 *     security:
 *       - userAuthentication: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.remove(req.UserId)
      .then(() => {
        res.send();
        next();
      })
      .catch((e: Error) => next(e));
  },
);

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
router.get(
  "/revokeEmail/:id",
  (req: Request, res: Response, next: NextFunction) => {
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
  },
);

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
router.get(
  "/confirmEmail/:id",
  (req: Request, res: Response, next: NextFunction) => {
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
  },
);

/**
 * @openapi
 * /user/access:
 *   get:
 *     description: Get all users that the current user has access to (children)
 *     tags:
 *       - User Access
 *     security:
 *       - userAuthentication: []
 *     responses:
 *       200:
 *         description: List of user access relationships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAccess'
 */
router.get(
  "/access",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserAccessService.getChildren(req.UserId)
      .then((access) => {
        res.send(access);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/access/owner:
 *     description: Get all owners that have shared access with the current user
 *     tags:
 *       - User Access
 *     security:
 *       - userAuthentication: []
 *     responses:
 *       200:
 *         description: List of owners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get(
  "/access/owner",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserAccessService.getOwners(req.UserId)
      .then((access) => {
        res.send(access);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/access:
 *   post:
 *     description: Invite a user by email to share access
 *     tags:
 *       - User Access
 *     security:
 *       - userAuthentication: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childEmail:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [coach, assistant, athlete]
 *     responses:
 *       200:
 *         description: Invitation sent
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/access",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { childEmail, role } = req.body;
    User.findOne({ where: { email: childEmail } })
      .then((child: User | null) => {
        if (!child) {
          return next(new Error("User not found"));
        }
        return UserAccessService.create(req.UserId, child.id, role, true);
      })
      .then((access) => {
        res.send(access);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/access/{id}:
 *   put:
 *     description: Update a user access relationship
 *     tags:
 *       - User Access
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
  "/access/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserAccessService.update(req.params.id, req.body, req.UserId)
      .then((access) => {
        res.send(access);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/access/{id}:
 *   delete:
 *     description: Remove a user access relationship
 *     tags:
 *       - User Access
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
 *         description: Removed
 */
router.delete(
  "/access/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserAccessService.remove(req.params.id, req.UserId)
      .then(() => {
        res.send();
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/access/{id}/accept:
 *   post:
 *     description: Accept an access invitation
 *     tags:
 *       - User Access
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
 *         description: Accepted
 */
router.post(
  "/access/:id/accept",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserAccessService.accept(req.params.id, req.UserId)
      .then((access) => {
        res.send(access);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /user/access/{id}/decline:
 *   post:
 *     description: Decline an access invitation
 *     tags:
 *       - User Access
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
 *         description: Declined
 *       404:
 *         description: Access not found
 */
router.post(
  "/access/:id/decline",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserAccessService.decline(req.params.id, req.UserId)
      .then((access) => {
        res.send(access);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as userRouter };
