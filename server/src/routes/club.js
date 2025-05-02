const { Router } = require("express");
const ClubService = require("../services/ClubService");
const { authenticateUser } = require("../services/AuthService");
const FileService = require("../services/FileService");
const path = require("node:path");
const NotificationService = require("../services/NotificationService");

const router = Router();

router.get("/:id?", authenticateUser(), (req, res, next) => {
  if (req.params.id)
    return ClubService.findById(req.params.id, req.UserId)
      .then((foundClub) => {
        if (!foundClub) res.status(404).send("Not found");
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

router.put("/:id", authenticateUser(), (req, res, next) => {
  return ClubService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.delete("/:id", authenticateUser(), (req, res, next) => {
  return ClubService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

router.put(
  "/:id/clubLogo",
  authenticateUser(),
  FileService.singleFileMiddleware("clubLogo"),
  (req, res, next) => {
    const clubId = req.params.id;
    if (!req.file) res.status(400).send("No file uploaded");
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

router.get("/:id/clubLogo", authenticateUser(), (req, res, next) => {
  const clubId = req.params.id;
  ClubService.findById(clubId, req.UserId)
    .then((foundClub) => {
      if (!foundClub.logoExtension) {
        res.status(400).send("No logo uploaded");
        return next();
      }
      const filename = foundClub.id + "." + foundClub.logoExtension;
      const root = path.join(__dirname, "../../uploads/clubLogos");
      if (filename.startsWith(clubId)) return res.sendFile(filename, { root });
      return next();
    })
    .catch((e) => next(e));
});

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
