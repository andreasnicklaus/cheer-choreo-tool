const jwt = require("jsonwebtoken");

type EmailAction = "confirm-email" | "revoke-email";

type EmailActionTokenPayload = {
  UserId: string;
  action: EmailAction;
};

function getTokenSecret(): string {
  const tokenSecret = process.env.TOKEN_SECRET;
  if (!tokenSecret) throw new Error("TOKEN_SECRET is not set");
  return tokenSecret;
}

export function createEmailActionToken(userId: string, action: EmailAction) {
  return jwt.sign({ UserId: userId, action }, getTokenSecret(), {
    expiresIn: "24h",
  });
}

export function verifyEmailActionToken(
  token: string,
  action: EmailAction,
): string {
  const payload = jwt.verify(
    token,
    getTokenSecret(),
  ) as EmailActionTokenPayload;
  if (payload.action !== action) throw new Error("Invalid email action token");
  return payload.UserId;
}
