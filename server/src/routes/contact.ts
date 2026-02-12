import { NextFunction, Request, Response, Router } from "express";
import ContactService from "@/services/ContactService";
import { openApiRateLimit } from "@/middlewares/rateLimitMiddleware";
import AuthService from "@/services/AuthService";

/**
 * @swagger
 * tags:
 * - name: Contact
 */

/** @ignore */
const router = Router();

/**
 * @openapi
 * /contact/:
 *   post:
 *     description: Send a new message to the support team
 *     tags:
 *       - Contact
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
 *               - email
 *               - subject
 *               - message
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message Received
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
router.post(
  "/",
  openApiRateLimit,
  AuthService.authenticateUser(false),
  (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message, category } = req.body;
    return ContactService.sendMessage(
      name,
      email,
      subject,
      message,
      category,
      req.locale,
      req.UserId,
    )
      .then((response: string) => {
        res.send(response);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as contactRouter };
