import { NextFunction, Request, Response, Router } from "express";
import User from "../db/models/user";
import { UniqueConstraintError, ValidationError } from "sequelize";
import UserService from "../services/UserService";
import MailService from "../services/MailService";
import NotificationService from "../services/NotificationService";
import FileService from "../services/FileService";

const bcrypt = require("bcrypt");
const path = require("node:path");
const { default: AuthService } = require("../services/AuthService");

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
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { username, password, email } = req.body;
  UserService.create(username, password, email, false, req.locale)
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
              : null
          );
        return next();
      } else if (e instanceof ValidationError) {
        const ve = e as ValidationError;
        res.status(400).send(ve.errors[0].message);
        return next();
      }
      next(e);
    });
});

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
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  UserService.findByUsernameOrEmail(username, { scope: "withPasswordHash" })
    .then(async (user: User | null) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
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
});

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
router.post("/ssoRequest", (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).send(req.t("responses.email-required"));
    return next();
  }

  AuthService.generateSsoToken(email, req.locale)
    .then(() => {
      res.send(req.t("responses.sso-link-sent")); // njsscan-ignore: express_xss
      return next();
    })
    .catch((e: Error) => next(e));
});

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
router.post("/sso", (req: Request, res: Response, next: NextFunction) => {
  const { ssoToken } = req.body;
  if (!ssoToken) {
    res.status(400).send(req.t("responses.sso-token-required"));
    return next();
  }

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
});

/**
 * @openapi
 * /auth/me:
 *  get:
 *    description: User information endpoint
 *    tags:
 *    - Authorization & Account Management
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.get("/me", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  UserService.findById(req.UserId)
    .then((user: User | null) => {
      res.send(user);
      return next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /auth/me:
 *  put:
 *    description: User update endpoint, sends confirmation email if email is updated
 *    tags:
 *    - Authorization & Account Management
 *    requestBody:
 *      $ref: '#/components/requestBodies/UserUpdateRequestBody'
 *    responses:
 *      200:
 *        description: Update successful
 *      404:
 *        description: User was not found
 */
router.put("/me", AuthService.authenticateUser(), (req: Request, res: Response, next: NextFunction) => {
  const { username, email, emailConfirmed } = req.body;
  const data = { username, email, emailConfirmed };
  if (email && email != req.User.email) data.emailConfirmed = false;
  UserService.update(req.UserId, data)
    .then((user: User | null) => {
      if (user && email != req.User.email)
        return MailService.sendEmailConfirmationEmail(
          user.username,
          user.id,
          user.email as string,
          req.locale
        ).then(() => {
          res.send();
          return next();
        });
      res.send(user);
      return next();
    })
    .catch((e: Error) => next(e));
});

/**
 * @openapi
 * /auth/me/profilePicture:
 *  put:
 *    description: Upload endpoint for profile picture
 *    tags:
 *    - Authorization & Account Management
 *    requestBody:
 *      $ref: '#/components/requestBodies/LoginRequestBody'
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
 */
router.put(
  "/me/profilePicture",
  AuthService.authenticateUser(),
  FileService.singleFileMiddleware("profilePicture"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) res.status(400).send(req.t("responses.no-file-uploaded"));
    else {
      const profilePictureExtension = req.file.filename.split(".").pop();
      UserService.update(req.UserId, {
        profilePictureExtension,
      }).then((user: User | null) => {
        FileService.clearProfilePictureFolder(
          req.UserId,
          profilePictureExtension
        );
        res.send(user);
        return next();
      });
    }
  }
);

/**
 * @openapi
 * /auth/me/profilePicture/:filename:
 *  get:
 *    description: Profile picture retrieval endpoint
 *    tags:
 *    - Authorization & Account Management
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
 *      404:
 *        description: File not found
 */
router.get(
  "/me/profilePicture/:filename",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params;
    const root = path.join(__dirname, "../../uploads/profilePictures");

    if (filename.startsWith(req.UserId))
      return res.sendFile(filename, { root });

    return next();
  }
);

/**
 * @openapi
 * /auth/me/profilePicture:
 *  delete:
 *    description: Delete the profile picture
 *    tags:
 *    - Authorization & Account Management
 *    responses:
 *      200:
 *        description: Deletion successful or no profile picture to be deleted
 */
router.delete(
  "/me/profilePicture",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.update(req.UserId, { profilePictureExtension: null })
      .then(() => {
        FileService.clearProfilePictureFolder(req.UserId);
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  }
);

/**
 * @openapi
 * /auth/me/resendEmailConfirmationLink:
 *  get:
 *    description: Resend the email confirmation link in a new email, creates a notification
 *    tags:
 *    - Authorization & Account Management
 *    responses:
 *      200:
 *        description: Email was sent
 */
router.get(
  "/me/resendEmailConfirmationLink",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    UserService.findById(req.UserId)
      .then((user: User | null) => {
        if (!user) {
          res.status(404).send(req.t("responses.user-not-found"));
          return next();
        }
        return MailService.sendEmailConfirmationEmail(
          user.username,
          user.id,
          user.email as string,
          req.locale
        ).then(() => {
          NotificationService.createOne(
            req.t("notifications.confirm-email.title"),
            req.t("notifications.confirm-email.message"),
            user.id
          );
          res.send();
          return next();
        });
      })
      .catch((e: Error) => next(e));
  }
);

export { router as authRouter };
