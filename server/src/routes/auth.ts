import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import User from "../db/models/user";
import { UniqueConstraintError } from "sequelize";
import UserService from "../services/UserService";
import MailService from "../services/MailService";
import NotificationService from "../services/NotificationService";
import FileService from "../services/FileService";
import { validate } from "@/middlewares/validateMiddleware";

const bcrypt = require("bcrypt");
const path = require("node:path");
const { default: AuthService } = require("../services/AuthService");

const registerSchema = z.object({
  username: z.string().min(6),
  email: z.email().optional().nullable().default(null),
  password: z.string().min(8),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const ssoRequestSchema = z.object({
  email: z.email(),
});

const ssoSchema = z.object({
  ssoToken: z.string().min(1),
});

const profilePictureParams = z.object({
  filename: z.string().min(1),
});

const updateMeSchema = z.object({
  username: z.string().min(6).optional(),
  email: z.email().optional(),
  emailConfirmed: z.boolean().optional(),
});

type RegisterBody = z.infer<typeof registerSchema>;
type LoginBody = z.infer<typeof loginSchema>;
type SsoRequestBody = z.infer<typeof ssoRequestSchema>;
type SsoBody = z.infer<typeof ssoSchema>;
type ProfilePictureParams = z.infer<typeof profilePictureParams>;
type UpdateMeBody = z.infer<typeof updateMeSchema>;

/**
 * @swagger
 * tags:
 *    name: Authorization & Account Management
 *    description: Endpoints for authentication and authorization
 * components:
 *  requestBodies:
 *    RegistrationRequestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *            - username
 *            - email
 *            - password
 *            properties:
 *              username:
 *                type: string
 *              email:
 *                type: string
 *                format: email
 *              password:
 *                type: string
 *                format: password
 *    LoginRequestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *            - username
 *            - password
 *            properties:
 *              username:
 *                type: string
 *              password:
 *                type: string
 *                format: password
 *    ssoRequestRequestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *            - email
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *    ssoRequestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *            - ssoToken
 *            properties:
 *              ssoToken:
 *                $ref: '#/components/schema/JWT'
 *    UserUpdateRequestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *            - username
 *            - email
 *            properties:
 *              username:
 *                type: string
 *              email:
 *                type: string
 *                format: email
 */

/** @ignore */
const router = Router();

/**
 * @openapi
 * /auth/:
 *  post:
 *    description: Registration endpoint
 *    tags:
 *    - Authorization & Account Management
 *    requestBody:
 *      $ref: '#/components/requestBodies/RegistrationRequestBody'
 *    responses:
 *      200:
 *        description: User successfully registered
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/JWT'
 *      400:
 *        description: User account could not be created
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: User already exists
 */
router.post(
  "/",
  validate(registerSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email } = req.body as RegisterBody;

    const searchIdentifier = email ? [username, email] : username;

    UserService.findDeletedByUsernameOrEmail(searchIdentifier)
      .then((deletedUser) => {
        if (deletedUser) {
          res.status(403).send(req.t("errors.account-deleted"));
          return next();
        }
        return createUser();
      })
      .catch((e: Error) => next(e));

    function createUser() {
      UserService.create(username, password, email as string, false, req.locale)
        .then((user: User) => {
          const token = AuthService.generateAccessToken(user.id);
          res.send(token);
          next();
        })
        .catch((e: Error) => {
          if (e instanceof UniqueConstraintError) {
            const ue = e as UniqueConstraintError;
            res
              .status(400)
              .send(
                Object.keys(ue.fields).includes("username") ||
                  Object.keys(ue.fields).includes("email")
                  ? req.t("errors.user-already-exists")
                  : null,
              );
            return next();
          }
          next(e);
        });
    }
  },
);

/**
 * @openapi
 * /auth/login:
 *  post:
 *    description: Login endpoint
 *    tags:
 *    - Authorization & Account Management
 *    requestBody:
 *      $ref: '#/components/requestBodies/LoginRequestBody'
 *    responses:
 *      200:
 *        description: Login successful
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/JWT'
 *      404:
 *        description: User was not found
 */
router.post(
  "/login",
  validate(loginSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body as LoginBody;
    UserService.findByUsernameOrEmail(username, { scope: "withPasswordHash" })
      .then(async (user: User | null) => {
        if (!user) {
          const deletedUser =
            await UserService.findDeletedByUsernameOrEmail(username);
          if (deletedUser) {
            res.status(403).send(req.t("errors.account-deleted"));
            return;
          }
          res.status(404).send();
          return;
        }
        if (!bcrypt.compareSync(password, user.password)) {
          res.status(404).send();
          return;
        }

        // if (user.email && !user.emailConfirmed)
        //   return res.status(400).send({
        //     type: "EmailUnconfirmed",
        //     message:
        //       "Du musst dein E-Mail-Adresse bestätigen, um dein Konto zu aktivieren",
        //   });
        await UserService.update(user.id, { lastLoggedIn: Date.now() });
        const token = AuthService.generateAccessToken(user.id);
        res.send(token);
        next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /auth/ssoRequest:
 *  post:
 *    description: Single Sign-On Request endpoint
 *    tags:
 *    - Authorization & Account Management
 *    requestBody:
 *      $ref: '#/components/requestBodies/ssoRequestRequestBody'
 *    responses:
 *      200:
 *        description: SSO link was sent
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: Single Sign-On link was sent to your email inbox.
 *      400:
 *        description: Email address not provided
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: An email address is required.
 */
router.post(
  "/ssoRequest",
  validate(ssoRequestSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as SsoRequestBody;

    AuthService.generateSsoToken(email, req.locale)
      .then(() => {
        res.send(req.t("responses.sso-link-sent")); // njsscan-ignore: express_xss
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /auth/sso:
 *  post:
 *    description: Single Sign-On Login endpoint
 *    tags:
 *    - Authorization & Account Management
 *    requestBody:
 *      $ref: '#/components/requestBodies/ssoRequestBody'
 *    responses:
 *      200:
 *        description: Login successful
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/JWT'
 *      400:
 *        description: User was not found
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: A SSO token is required. Please contact admin@choreo-planer.de
 */
router.post(
  "/sso",
  validate(ssoSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { ssoToken } = req.body as SsoBody;

    AuthService.resolveSsoToken(ssoToken, req.locale)
      .then((user: User) => {
        if (!user) {
          res.status(404).send(req.t("responses.user-not-found"));
          return next();
        }
        const token = AuthService.generateAccessToken(user.id);
        res.send(token);
        return next();
      })
      .catch((e: Error) => {
        res.status(400).send(e.message);
        return next();
      });
  },
);

/**
 * @openapi
 * /auth/me:
 *  get:
 *    description: User information endpoint
 *    tags:
 *    - Authorization & Account Management
 *    security:
 *      - userAuthentication: []
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/me",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.findById(req.actingUserId)
      .then((user: User | null) => {
        res.send(user);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /auth/me:
 *  put:
 *    description: User update endpoint, sends confirmation email if email is updated
 *    tags:
 *    - Authorization & Account Management
 *    security:
 *      - userAuthentication: []
 *    requestBody:
 *      $ref: '#/components/requestBodies/UserUpdateRequestBody'
 *    responses:
 *      200:
 *        description: Update successful
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: User was not found
 */
router.put(
  "/me",
  AuthService.authenticateUser(),
  validate(updateMeSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const { username, email, emailConfirmed } = req.body as UpdateMeBody;
    const data = { username, email, emailConfirmed };
    if (email && email != req.ActingUser.email) data.emailConfirmed = false;
    UserService.update(req.actingUserId, data)
      .then((user: User | null) => {
        if (user && email != req.ActingUser.email)
          return MailService.sendEmailConfirmationEmail(
            user.username,
            user.id,
            user.email as string,
            req.locale,
          ).then(() => {
            res.send();
            return next();
          });
        res.send(user);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /auth/me/profilePicture:
 *  put:
 *    description: Upload endpoint for profile picture
 *    tags:
 *    - Authorization & Account Management
 *    security:
 *      - userAuthentication: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              profilePicture:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: Upload successful
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: No file uploaded
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: No file uploaded.
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  "/me/profilePicture",
  AuthService.authenticateUser(),
  FileService.singleFileMiddleware("profilePicture"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) res.status(400).send(req.t("responses.no-file-uploaded"));
    else {
      const profilePictureExtension = req.file.filename.split(".").pop();
      UserService.update(req.actingUserId, {
        profilePictureExtension,
      }).then((user: User | null) => {
        FileService.clearProfilePictureFolder(
          req.actingUserId,
          profilePictureExtension,
        );
        res.send(user);
        return next();
      });
    }
  },
);

/**
 * @openapi
 * /auth/me/profilePicture/:filename:
 *  get:
 *    description: Profile picture retrieval endpoint
 *    tags:
 *    - Authorization & Account Management
 *    security:
 *      - userAuthentication: []
 *    parameters:
 *    - name: filename
 *      in: path
 *      description: file name of the stored profilePicture. Defaults to the user id + the profilePictureExtension
 *      required: true
 *      schema:
 *        type: string
 *        example: a7ddc23a-3220-46ae-b640-22d8d480f5d1.png
 *    responses:
 *      200:
 *        description: Success
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: File not found
 */
router.get(
  "/me/profilePicture/:filename",
  AuthService.authenticateUser(),
  validate(profilePictureParams, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params as ProfilePictureParams;
    const root = path.join(__dirname, "../../uploads/profilePictures");

    if (filename.startsWith(req.actingUserId))
      return res.sendFile(filename, { root });

    return next();
  },
);

/**
 * @openapi
 * /auth/me/profilePicture:
 *  delete:
 *    description: Delete the profile picture
 *    tags:
 *    - Authorization & Account Management
 *    security:
 *      - userAuthentication: []
 *    responses:
 *      200:
 *        description: Deletion successful or no profile picture to be deleted
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  "/me/profilePicture",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.update(req.actingUserId, { profilePictureExtension: null })
      .then(() => {
        FileService.clearProfilePictureFolder(req.actingUserId);
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /auth/me/resendEmailConfirmationLink:
 *  get:
 *    description: Resend the email confirmation link in a new email, creates a notification
 *    tags:
 *    - Authorization & Account Management
 *    security:
 *      - userAuthentication: []
 *    responses:
 *      200:
 *        description: Email was sent
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/me/resendEmailConfirmationLink",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.findById(req.actingUserId)
      .then((user: User | null) => {
        if (!user) {
          res.status(404).send(req.t("responses.user-not-found"));
          return next();
        }
        return MailService.sendEmailConfirmationEmail(
          user.username,
          user.id,
          user.email as string,
          req.locale,
        ).then(() => {
          NotificationService.createOne(
            req.t("notifications.confirm-email.title"),
            req.t("notifications.confirm-email.message"),
            user.id,
          );
          res.send();
          return next();
        });
      })
      .catch((e: Error) => next(e));
  },
);

export { router as authRouter };
