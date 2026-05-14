import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import ContactService from "@/services/ContactService";
import { openApiRateLimit } from "@/middlewares/rateLimitMiddleware";
import AuthService from "@/services/AuthService";
import { validate } from "@/middlewares/validateMiddleware";

const createContactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  category: z.string().min(1),
});

type CreateContactBody = z.infer<typeof createContactSchema>;

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
  validate(createContactSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message, category } = req.body as CreateContactBody;
    return ContactService.sendMessage(
      name,
      email,
      subject,
      message,
      category,
      req.locale,
      req.actingUserId,
    )
      .then((response: string) => {
        res.send(response);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as contactRouter };
