import { Request } from "express";
import { Multer } from "multer";

const multer = require("multer");
const { readdir, unlink } = require("node:fs/promises");
const path = require("node:path");
const { logger } = require("../plugins/winston");
const _express = require("express");

const profilePictureStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/profilePictures/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${req.UserId}.${file.originalname.split(".").pop()}`);
  },
});
const clubLogoStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/clubLogos/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${req.params.id}.${file.originalname.split(".").pop()}`);
  },
});
const generalStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
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
  profilePictureUpload: Multer;
  clubLogoUpload: Multer;
  generalUpload: Multer;
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
   * @param {string} fileKey
   * @returns {_express.NextFunction} middleware function
   */
  singleFileMiddleware(fileKey: string) {
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
  clearProfilePictureFolder(userId: string, fileExtension: string | null = null) {
    logger.debug(`FileService.clearProfilePictureFolder ${JSON.stringify({ userId, fileExtension })}`)
    return readdir(path.join(__dirname, "../..", "uploads", "profilePictures"))
      .then((files: string[]) => {
        files
          .filter(
            (file) => file.startsWith(userId) && (fileExtension == null || !file.endsWith(fileExtension))
          )
          .forEach((file) => {
            unlink(
              path.join(__dirname, "../..", "uploads", "profilePictures", file)
            );
          });
      })
      .catch((e: Error) => logger.error(e));
  }

  /**
   * Remove the club logo of a specific club in the club logo folder
   *
   * @param {UUID} clubId
   * @param {string} fileExtension
   * @returns {Promise<void>}
   */
  clearClubLogoFolder(clubId: string, fileExtension: string | null = null) {
    logger.debug(`FileService.clearClubLogoFolder ${JSON.stringify({ clubId, fileExtension })}`)
    return readdir(path.join(__dirname, "../..", "uploads", "clubLogos"))
      .then((files: string[]) => {
        files
          .filter(
            (file) => file.startsWith(clubId) && (!fileExtension || !file.endsWith(fileExtension))
          )
          .forEach((file) => {
            unlink(path.join(__dirname, "../..", "uploads", "clubLogos", file));
          });
      })
      .catch((e: Error) => logger.error(e));
  }
}

export default new FileService();
