import { rateLimit } from "express-rate-limit";

export const totalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 240,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    const ignorePaths = ["/health", "/status", "/contact"];
    return ignorePaths.includes(req.path);
  },
});

export const openApiRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 30,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
