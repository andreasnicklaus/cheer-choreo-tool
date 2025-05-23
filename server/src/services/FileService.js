const multer = require("multer");
const { readdir, unlink } = require("node:fs/promises");
const path = require("node:path");
const { logger } = require("../plugins/winston");
const express = require("express");

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

/**
 * Service for file management operations.
 * Handles file uploads, downloads, and storage logic.
 *
 * @class FileService
 */
class FileService {
  /**
   * Creates an instance of FileService.
   * Initializes storages for profile pictures, club logos, and general files.
   *
   * @constructor
   */
  constructor() {
    this.profilePictureUpload = multer({ storage: profilePictureStorage });
    this.clubLogoUpload = multer({ storage: clubLogoStorage });
    this.generalUpload = multer({ storage: generalStorage });
  }

  /**
   * Generate a middleware for file upload
   *
   * @param {*} fileKey
   * @returns {express.NextFunction} middleware function
   */
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

  /**
   * Remove the profile image of a specific user in the profile picture folder
   *
   * @param {UUID} userId
   * @param {string} fileExtension
   * @returns {Promise<void>}
   */
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
      .catch((e) => logger.error(e));
  }

  /**
   * Remove the club logo of a specific club in the club logo folder
   *
   * @param {UUID} clubId
   * @param {string} fileExtension
   * @returns {Promise<void>}
   */
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
      .catch((e) => logger.error(e));
  }
}

module.exports = new FileService();
