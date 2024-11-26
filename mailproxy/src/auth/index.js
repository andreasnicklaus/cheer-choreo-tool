const MAILPROXY_SECRET = process.env.MAILPROXY_SECRET;

function authenticate(req, res, next) {
  const authHeader = req.headers?.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send();
  }
  if (token != MAILPROXY_SECRET) {
    return res.status(403).send();
  }

  next();
}

module.exports = authenticate;
