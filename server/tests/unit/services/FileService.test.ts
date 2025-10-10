import { describe, test, expect } from "@jest/globals";
import FileService from "@/services/FileService";
import { Request, Response } from "express";
import { unlink } from "node:fs/promises";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: console.log,
    error: jest.fn(),
  },
  debug: jest.fn(),
}));

jest.mock("node:fs/promises", () => {
  const mockFiles = [
    "user123.png",
    "user123.jpg",
    "otheruser.png",
    "user123.keepme",
  ];
  return {
    readdir: jest.fn().mockResolvedValueOnce(mockFiles),
    unlink: jest.fn(),
  };
});

jest
  .spyOn(require("node:path"), "join")
  .mockImplementation((...args) => args[args.length - 1]);

describe("FileService", () => {
  test("singleFileMiddleWare returns a function that gets and store and image from an http request", async () => {
    const mockReq = {
      headers: {},
    };
    const mockRes = {};
    const mockNext = jest.fn();

    const middleware = FileService.singleFileMiddleware("profilePicture");
    expect(typeof middleware).toBe("function");

    // We can't run Multer's actual middleware without Express, but we can check that it exists
    expect(() =>
      middleware(mockReq as Request, mockRes as Response, mockNext),
    ).not.toThrow();
  });

  test("clearProfilePictureFolder removes all images for a specific user id but keeps files with specified extension", async () => {
    await FileService.clearProfilePictureFolder("user123", ".keepme");
    // Should call unlink for user123 files except .keepme
    expect(unlink).toHaveBeenCalledWith(expect.stringContaining("user123.png"));
    expect(unlink).toHaveBeenCalledWith(expect.stringContaining("user123.jpg"));
    // Should NOT call unlink for user123.keepme or otheruser.png
    expect(unlink).not.toHaveBeenCalledWith(
      expect.stringContaining("user123.keepme"),
    );
    expect(unlink).not.toHaveBeenCalledWith(
      expect.stringContaining("otheruser.png"),
    );
  });

  test("clearClubLogoFolder removes all images for a specific club id but keeps files with specified extension", async () => {
    // Mock fs/promises readdir and unlink
    const mockFiles = [
      "club456.png",
      "club456.jpg",
      "otherclub.png",
      "club456.keepme",
    ];
    const readdirSpy = jest
      .spyOn(require("node:fs/promises"), "readdir")
      .mockResolvedValue(mockFiles);
    const unlinkSpy = jest
      .spyOn(require("node:fs/promises"), "unlink")
      .mockResolvedValue(undefined);
    await FileService.clearClubLogoFolder("club456", ".keepme");
    // Should call unlink for club456 files except .keepme
    expect(unlinkSpy).toHaveBeenCalledWith(
      expect.stringContaining("club456.png"),
    );
    expect(unlinkSpy).toHaveBeenCalledWith(
      expect.stringContaining("club456.jpg"),
    );
    // Should NOT call unlink for club456.keepme or otherclub.png
    expect(unlinkSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("club456.keepme"),
    );
    expect(unlinkSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("otherclub.png"),
    );
    readdirSpy.mockRestore();
    unlinkSpy.mockRestore();
  });
});
