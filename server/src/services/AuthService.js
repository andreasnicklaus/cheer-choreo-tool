const jwt = require("jsonwebtoken");
const User = require("../db/models/user");
const { logger } = require("../plugins/winston");
const UserService = require("./UserService");

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

class AuthService {
  generateAccessToken(UserId) {
    return jwt.sign({ UserId }, TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  authenticateUser(failIfNotLoggedIn = true) {
    return function (req, res, next) {
      const authHeader = req.headers?.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        if (!failIfNotLoggedIn) return next();
        return res.status(401).send();
      }

      jwt.verify(token, TOKEN_SECRET, async (err, content) => {
        if (err) {
          if (!failIfNotLoggedIn) return next();
          return res.status(403);
          // content = { UserId: (await UserService.getAll())[0].id };
        }

        User.findByPk(content.UserId)
          .then((user) => {
            if (!user) {
              if (!failIfNotLoggedIn) return next();
              return res.status(403).send();
            }

            logger.debug(
              `User ${user.username} with id ${user.id} used this token: ${token}`
            );
            req.UserId = user.id;
            next();
          })
          .catch((e) => next(e));
      });
    };
  }
}

module.exports = new AuthService();
