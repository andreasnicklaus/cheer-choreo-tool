const multer = require("multer");
const { readdir, unlink } = require("node:fs/promises");
const path = require("node:path");

const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilePictures/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.UserId}.${file.originalname.split(".").pop()}`);
  },
});
const clubLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/clubLogos/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.${file.originalname.split(".").pop()}`);
  },
});
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.UserId}.${file.originalname.split(".").pop()}`);
  },
});

class FileService {
  constructor() {
    this.profilePictureUpload = multer({ storage: profilePictureStorage });
    this.clubLogoUpload = multer({ storage: clubLogoStorage });
    this.generalUpload = multer({ storage: generalStorage });
  }

  singleFileMiddleware(fileKey) {
    let upload;
    switch (fileKey) {
      case "profilePicture":
        upload = this.profilePictureUpload;
        break;
      case "clubLogo":
        upload = this.clubLogoUpload;
        break;
      default:
        upload = this.generalUpload;
    }
    return upload.single(fileKey);
  }

  clearProfilePictureFolder(userId, fileExtension) {
    return readdir(path.join(__dirname, "../..", "uploads", "profilePictures"))
      .then((files) => {
        files
          .filter(
            (file) => file.startsWith(userId) && !file.endsWith(fileExtension)
          )
          .forEach((file) => {
            unlink(
              path.join(__dirname, "../..", "uploads", "profilePictures", file)
            );
          });
      })
      .catch((e) => console.error(e));
    // TODO: better error handling
  }

  clearClubLogoFolder(clubId, fileExtension) {
    return readdir(path.join(__dirname, "../..", "uploads", "clubLogos"))
      .then((files) => {
        files
          .filter(
            (file) => file.startsWith(clubId) && !file.endsWith(fileExtension)
          )
          .forEach((file) => {
            unlink(path.join(__dirname, "../..", "uploads", "clubLogos", file));
          });
      })
      .catch((e) => console.error(e));
    // TODO: better error handling
  }
}

module.exports = new FileService();
