import { NextFunction, Request, Response } from "express";
import User from "../db/models/user";
import Admin from "../db/models/admin";
import UserService from "./UserService";
import MailService from "./MailService";
import NotificationService from "./NotificationService";
import AdminService from "./AdminService";
import {
  AuthorizationError,
  FaultyInputError,
  NotFoundError,
} from "@/utils/errors";

const jwt = require("jsonwebtoken");
const { logger } = require("../plugins/winston");
const basicAuth = require("express-basic-auth");
const bcrypt = require("bcrypt");
const i18n = require("i18n");
const _express = require("express");

/**
 * Secret to encode the JWTs with
 *
 * @type {string}
 * @ignore
 */
const TOKEN_SECRET = process.env.TOKEN_SECRET;
/**
 * Description string for expiration time of JWTs
 *
 * @type {string}
 * @ignore
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

type jwtContent = {
  UserId: string;
};

declare module "express-serve-static-core" {
  interface Request {
    UserId: string;
    User: User;
    AdminId: string;
    Admin: Admin;
    locale: string;
    t: (key: string, options?: Record<string, object | string>) => string;
  }
}

/**
 * Service for authentication operations.
 * Handles user login, registration, and authentication logic.
 *
 * @class AuthService
 */
class AuthService {
  /**
   * Generates an access token
   *
   * @param {UUID} UserId
   * @param {Object} [options={}]
   * @param {string | undefined | null} [options.expiresIn=null]
   * @returns {string}
   */
  generateAccessToken(
    UserId: string,
    { expiresIn = null }: { expiresIn?: string | null } = {},
  ) {
    logger.debug(
      `AuthService generateAccessToken ${JSON.stringify({ UserId, expiresIn })}`,
    );
    return jwt.sign({ UserId }, TOKEN_SECRET, {
      expiresIn: expiresIn || JWT_EXPIRES_IN,
    });
  }

  /**
   * Middleware generator for user authentication
   *
   * @param {boolean} [failIfNotLoggedIn=true]
   * @returns {function(): any} middleware function
   */
  authenticateUser(failIfNotLoggedIn = true) {
    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {any}
     */
    return function (req: Request, res: Response, next: NextFunction) {
      const authHeader = req.headers?.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        if (!failIfNotLoggedIn) return next();
        return res.status(401).send();
      }

      jwt.verify(
        token,
        TOKEN_SECRET,
        async (err: Error, content: jwtContent) => {
          if (err) {
            if (!failIfNotLoggedIn) return next();
            return res.status(403);
          }

          User.findByPk(content.UserId)
            .then((user: User | null) => {
              if (!user) {
                if (!failIfNotLoggedIn) return next();
                return res.status(403).send();
              }

              logger.debug(
                `User ${user.username} with id ${user.id} used this token: ${token}`,
              );
              req.UserId = user.id;
              req.User = user;
              next();
            })
            .catch((e) => next(e));
        },
      );
    };
  }

  /**
   * Resolves Single Sign-On Tokens to a user it belongs to
   *
   * @param {string} token
   * @param {string} [locale="en"]
   * @returns {Promise<User>}
   * @throws {Error} Token has to be a valid and not-expired JWT token
   * @throws {Error} User the token belongs to has to (still) exist
   */
  resolveSsoToken(token: string, locale = "en"): Promise<User> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        TOKEN_SECRET,
        async (err: Error | null, content: jwtContent) => {
          if (err) {
            return reject(
              new AuthorizationError(
                i18n.__({ phrase: "errors.invalid-sso-token", locale }),
              ),
            );
          }

          return User.findByPk(content.UserId).then((user) => {
            if (!user) {
              return reject(
                new AuthorizationError(
                  i18n.__({ phrase: "errors.sso-token-user-missing", locale }),
                ),
              );
            }

            logger.debug(
              `User ${user.username} with id ${user.id} used this SSO token: ${token}`,
            );
            resolve(user);
          });
        },
      );
    });
  }

  /**
   * Generate a Single Sign-On token for login via login-link
   *
   * @param {string} email Username or email address of a user
   * @param {string} [locale="en"]
   * @returns {Promise}
   * @throws {Error} User with give email/username has to (still) exist
   * @throws {Error} User with given username has to have an email address
   */
  generateSsoToken(email: string, locale = "en") {
    logger.debug(
      `AuthService generateSsoToken ${JSON.stringify({ email, locale })}`,
    );
    return UserService.findByUsernameOrEmail(email).then(
      (user: User | null) => {
        if (!user) {
          logger.warn(`No user with email ${email} found`);
          throw new NotFoundError(
            i18n.__(
              { phrase: "errors.entity-not-found", locale },
              { entity: "user" },
            ),
          );
        }
        if (!user.email) {
          logger.warn("Found user has no email");
          throw new FaultyInputError(
            i18n.__({ phrase: "errors.user-has-no-email", locale }),
          );
        }

        const token = this.generateAccessToken(user.id, {
          expiresIn: process.env.SSO_TOKEN_EXPIRES_IN,
        });
        return MailService.sendSsoEmail(
          user.email,
          user.username,
          token,
          locale,
        ).then(() =>
          NotificationService.createOne(
            i18n.__({
              phrase: "notifications.sso-link-was-sent.title",
              locale,
            }),
            i18n.__({
              phrase: "notifications.sso-link-was-sent.message",
              locale,
            }),
            user.id,
          ),
        );
      },
    );
  }

  /**
   * Middleware generator for admin authentication
   *
   * @returns {function(): any}
   */
  authenticateAdmin() {
    /**
     * Authorizes an admin user based on username and password.
     * @param {string} username - Admin's username.
     * @param {string} password - Admin's password.
     * @param {function} callback - Callback function to handle authorization result.
     * @returns {void}
     */
    function myAuthorizer(
      username: string,
      password: string,
      callback: (err: Error | null, authorized: boolean) => void,
    ) {
      return AdminService.findByUsername(username, {
        scope: "withPasswordHash",
      })
        .then((admin: Admin | null) => {
          if (!admin || !bcrypt.compareSync(password, admin.password))
            return callback(null, false);
          return callback(null, true);
        })
        .catch((e: Error) => {
          logger.error(e);
          return callback(null, false);
        });
    }
    /**
     * @param {_express.Request} req
     * @param {_express.Response} res
     * @param {_express.NextFunction} next
     * @returns {any}
     */
    return basicAuth({
      authorizer: myAuthorizer,
      authorizeAsync: true,
      challenge: true,
      realm: "ChoreoPlanerAdmin",
    });
  }

  /**
   * Middleware for resolving admin auth tokens to the Admin
   *
   * @param {_express.Request} req
   * @param {_express.Response} res
   * @param {_express.NextFunction} next
   * @returns {Promise}
   */
  resolveAdmin(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers?.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return next(new AuthorizationError("No token provided"));
    }
    const [username, ..._] = atob(token).split(":");

    return AdminService.findByUsername(username, {
      scope: "withPasswordHash",
    })
      .then((admin: Admin | null) => {
        if (admin) {
          req.AdminId = admin.id;
          req.Admin = admin;
        }
        next();
      })
      .catch((e: Error) => next(e));
  }
}

export default new AuthService();
