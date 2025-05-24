const { Router } = require("express");
const { authenticateUser } = require("../services/AuthService");
const UserService = require("../services/UserService");

const router = Router();

/**
 * @openapi
 * /users/:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     tags:
 *      - Users
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
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
router.put("/", authenticateUser(), (req, res, next) => {
  UserService.update(req.UserId, req.body)
    .then((user) => {
      res.send(user);
      next();
    })
    .catch((e) => next(e));
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
router.delete("/", authenticateUser(), (req, res, next) => {
  UserService.remove(req.UserId)
    .then((result) => {
      res.send(result);
      next();
    })
    .catch((e) => next(e));
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
router.get("/revokeEmail/:id", (req, res, next) => {
  UserService.remove(req.params.id)
    .then((_result) => {
      res.render("../src/views/emailRevoked.ejs", {
        frontendDomain: process.env.FRONTEND_DOMAIN,
      }); // njsscan-ignore: express_lfr_warning
      next();
    })
    .catch((e) => {
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
router.get("/confirmEmail/:id", (req, res, next) => {
  UserService.update(req.params.id, { emailConfirmed: true })
    .then((_result) => {
      res.render("../src/views/emailConfirmed.ejs", {
        frontendDomain: process.env.FRONTEND_DOMAIN,
      }); // njsscan-ignore: express_lfr_warning
      next();
    })
    .catch((e) => {
      res.render("../src/views/error.ejs", {
        action: "email-confirmation",
        data: JSON.stringify({ userId: req.params.id }),
        error: e,
        timestamp: new Date().toLocaleString(req.locale),
      }); // njsscan-ignore: express_lfr_warning
    });
});

module.exports = { userRouter: router };
