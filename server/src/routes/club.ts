import { NextFunction, Request, Response, Router } from "express";
import Club from "../db/models/club";
import ClubService from "../services/ClubService";
import NotificationService from "../services/NotificationService";
import FileService from "../services/FileService";
import { NotFoundError } from "@/utils/errors";

const path = require("node:path");
const { default: AuthService } = require("../services/AuthService");

const router = Router();

/**
 * @openapi
 * /club/{id}:
 *   get:
 *     description: Get a specific club by ID, or all clubs if no ID is provided. Optionally filter by name.
 *     tags:
 *       - Clubs
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club(s) found
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Club'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Club'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Club not found
 */
router.get(
  "/{:id}",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id)
      return ClubService.findById(req.params.id, req.UserId)
        .then((foundClub: Club | null) => {
          if (!foundClub) throw new NotFoundError();
          else res.send(foundClub);
          return next();
        })
        .catch((e: Error) => next(e));
    else {
      if (req.query.name)
        return ClubService.findByName(req.query.name as string, req.UserId)
          .then((clubList: Club[]) => {
            res.send(clubList);
            return next();
          })
          .catch((e: Error) => next(e));
      else
        return ClubService.getAll(req.UserId)
          .then((clubList: Club[]) => {
            res.send(clubList);
            return next();
          })
          .catch((e: Error) => next(e));
    }
  },
);

/**
 * @openapi
 * /club/:
 *   post:
 *     description: Create a new club
 *     tags:
 *       - Clubs
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Club created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    return ClubService.create(name, req.UserId)
      .then((club: Club) => {
        NotificationService.createOne(
          req.t("notifications.club-created.title"),
          req.t("notifications.club-created.message", { name }),
          req.UserId,
        );
        res.send(club);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /club/{id}:
 *   put:
 *     description: Update a club by ID
 *     tags:
 *       - Clubs
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Club'
 *     responses:
 *       200:
 *         description: Club updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Club not found
 */
router.put(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    return ClubService.update(req.params.id, req.body, req.UserId)
      .then((club: Club) => {
        res.send(club);
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /club/{id}:
 *   delete:
 *     description: Delete a club by ID
 *     tags:
 *       - Clubs
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Club not found
 */
router.delete(
  "/:id",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    return ClubService.remove(req.params.id, req.UserId)
      .then(() => {
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /club/{id}/clubLogo:
 *   put:
 *     description: Upload a club logo for a club
 *     tags:
 *       - Clubs
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               clubLogo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Club logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       400:
 *         description: No file uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  "/:id/clubLogo",
  AuthService.authenticateUser(),
  FileService.singleFileMiddleware("clubLogo"),
  (req: Request, res: Response, next: NextFunction) => {
    const clubId = req.params.id;
    if (!req.file) res.status(400).send(req.t("responses.no-file-uploaded"));
    else {
      const logoExtension = req.file.filename.split(".").pop();
      ClubService.update(
        clubId,
        {
          logoExtension,
        },
        req.UserId,
      ).then((club: Club) => {
        FileService.clearClubLogoFolder(club.id, logoExtension as string);
        res.send(club);
        return next();
      });
    }
  },
);

/**
 * @openapi
 * /club/{id}/clubLogo:
 *   get:
 *     description: Get the club logo for a club
 *     tags:
 *       - Clubs
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club logo file
 *       400:
 *         description: No file uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/:id/clubLogo",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const clubId = req.params.id;
    ClubService.findById(clubId, req.UserId)
      .then((foundClub: Club | null) => {
        if (!foundClub?.logoExtension) {
          res.status(400).send(req.t("responses.no-file-uploaded"));
          return next();
        }
        const filename = foundClub.id + "." + foundClub.logoExtension;
        const root = path.join(__dirname, "../../uploads/clubLogos");
        if (filename.startsWith(clubId))
          return res.sendFile(filename, { root });
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

/**
 * @openapi
 * /club/{id}/clubLogo:
 *   delete:
 *     description: Delete the club logo for a club
 *     tags:
 *       - Clubs
 *     security:
 *       - userAuthentication: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club logo deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  "/:id/clubLogo",
  AuthService.authenticateUser(),
  (req: Request, res: Response, next: NextFunction) => {
    const clubId = req.params.id;
    ClubService.update(clubId, { logoExtension: null }, req.UserId)
      .then(() => {
        FileService.clearClubLogoFolder(clubId);
        res.send();
        return next();
      })
      .catch((e: Error) => next(e));
  },
);

export { router as clubRouter };
