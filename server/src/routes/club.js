const { Router } = require("express");
const ClubService = require("../services/ClubService");
const { authenticateUser } = require("../services/AuthService");
const FileService = require("../services/FileService");
const path = require("node:path");
const NotificationService = require("../services/NotificationService");

const router = Router();

/**
 * @openapi
 * /club/{id}:
 *   get:
 *     description: Get a specific club by ID, or all clubs if no ID is provided. Optionally filter by name.
 *     tags:
 *       - Clubs
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
 *       404:
 *         description: Club not found
 */
router.get("/:id?", authenticateUser(), (req, res, next) => {
  if (req.params.id)
    return ClubService.findById(req.params.id, req.UserId)
      .then((foundClub) => {
        if (!foundClub) res.status(404).send(req.t("responses.not-found"));
        else res.send(foundClub);
        return next();
      })
      .catch((e) => next(e));
  else {
    if (req.query.name)
      return ClubService.findByName(req.query.name, req.UserId)
        .then((clubList) => {
          res.send(clubList);
          return next();
        })
        .catch((e) => next(e));
    else
      return ClubService.getAll(req.UserId)
        .then((clubList) => {
          res.send(clubList);
          return next();
        })
        .catch((e) => next(e));
  }
});

/**
 * @openapi
 * /club/:
 *   post:
 *     description: Create a new club
 *     tags:
 *       - Clubs
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
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { name } = req.body;
  return ClubService.create(name, req.UserId)
    .then((club) => {
      NotificationService.createOne(
        req.t("notifications.club-created.title"),
        req.t("notifications.club-created.message", { name }),
        req.UserId
      );
      res.send(club);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /club/{id}:
 *   put:
 *     description: Update a club by ID
 *     tags:
 *       - Clubs
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
 *       404:
 *         description: Club not found
 */
router.put("/:id", authenticateUser(), (req, res, next) => {
  return ClubService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /club/{id}:
 *   delete:
 *     description: Delete a club by ID
 *     tags:
 *       - Clubs
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club deleted successfully
 *       404:
 *         description: Club not found
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  return ClubService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /club/{id}/clubLogo:
 *   put:
 *     description: Upload a club logo for a club
 *     tags:
 *       - Clubs
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
 */
router.put(
  "/:id/clubLogo",
  authenticateUser(),
  FileService.singleFileMiddleware("clubLogo"),
  (req, res, next) => {
    const clubId = req.params.id;
    if (!req.file) res.status(400).send(req.t("responses.no-file-uploaded"));
    else {
      const logoExtension = req.file.filename.split(".").pop();
      ClubService.update(
        clubId,
        {
          logoExtension,
        },
        req.UserId
      ).then((club) => {
        FileService.clearClubLogoFolder(club.id, logoExtension);
        res.send(club);
        return next();
      });
    }
  }
);

/**
 * @openapi
 * /club/{id}/clubLogo:
 *   get:
 *     description: Get the club logo for a club
 *     tags:
 *       - Clubs
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
 */
router.get("/:id/clubLogo", authenticateUser(), (req, res, next) => {
  const clubId = req.params.id;
  ClubService.findById(clubId, req.UserId)
    .then((foundClub) => {
      if (!foundClub.logoExtension) {
        res.status(400).send(req.t("responses.no-file-uploaded"));
        return next();
      }
      const filename = foundClub.id + "." + foundClub.logoExtension;
      const root = path.join(__dirname, "../../uploads/clubLogos");
      if (filename.startsWith(clubId)) return res.sendFile(filename, { root });
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /club/{id}/clubLogo:
 *   delete:
 *     description: Delete the club logo for a club
 *     tags:
 *       - Clubs
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club logo deleted successfully
 */
router.delete("/:id/clubLogo", authenticateUser(), (req, res, next) => {
  const clubId = req.params.id;
  ClubService.update(clubId, { logoExtension: null }, req.UserId)
    .then(() => {
      FileService.clearClubLogoFolder(clubId);
      res.send();
      return next();
    })
    .catch((e) => next(e));
});

module.exports = { clubRouter: router };
