import { NextFunction, Request, Response, Router } from "express";
import ChoreoService from "@/services/ChoreoService";
import UserService from "@/services/UserService";
import { openApiRateLimit } from "@/middlewares/rateLimitMiddleware";

/** @ignore */
const router = Router();

// Simple in-memory cache (5 minutes) to avoid counting on every request.
let cached: { choreographies: number; users: number; at: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * @openapi
 * /stats/public:
 *   get:
 *     description: Public aggregate counts for the landing page
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: Aggregate counts
 */
router.get("/public", openApiRateLimit, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = Date.now();
    if (cached && now - cached.at < CACHE_TTL_MS) {
      res.json({ choreographies: cached.choreographies, users: cached.users });
      return;
    }
    const [choreographies, users] = await Promise.all([
      ChoreoService.getCount(),
      UserService.getCount(),
    ]);
    cached = { choreographies, users, at: now };
    res.json({ choreographies, users });
  } catch (err) {
    next(err);
  }
});

export { router as statsRouter };