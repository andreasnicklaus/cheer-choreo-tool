import { describe, test, expect } from "@jest/globals";
import { Sequelize } from "sequelize";
import AdminService from "@/services/AdminService";
import Admin from "@/db/models/admin";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
}));

jest.mock("@/db/db", () => {
  return new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
});

jest.mock("@/plugins/nodemailer", () => ({
  sendMail: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
}));

const adminName = "adminName";
const adminPw = "adminPW";

describe("AdminServices", () => {
  beforeAll(async () => {
    process.env.DEFAULT_ADMIN_USERNAME = adminName;
    process.env.DEFAULT_ADMIN_PASSWORD = adminPw;
    process.env.IsTest = "true";
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    const admins = await Admin.findAll();
    admins.forEach(
      async (admin: Admin) => await admin.destroy({ force: true })
    );
  });

  test("getCount should return the actual count", async () => {
    expect(await AdminService.getCount()).toBe(0);
    await AdminService.findOrCreate(adminName, adminPw);
    expect(await AdminService.getCount()).toBe(1);
  });

  test("findOrCreate should find existing admin", async () => {
    const admin1 = await AdminService.findOrCreate(adminName, adminPw);
    const admin2 = await AdminService.findOrCreate(adminName, adminPw);
    expect(admin1.id).toBe(admin2.id);
  });

  test("findOrCreate should create new admin", async () => {
    const newAdminName = "newAdmin";
    const newAdminPw = "newAdminPw";
    const admin = await AdminService.findOrCreate(newAdminName, newAdminPw);
    expect(admin.username).toBe(newAdminName);
    expect(await AdminService.getCount()).toBe(1);
  });

  test("findByUsername should find existing admin", async () => {
    const notFoundAdmin = await AdminService.findByUsername("asdf");
    expect(notFoundAdmin).toBeNull();
    await AdminService.findOrCreate(adminName, adminPw);
    const admin = await AdminService.findByUsername(adminName);
    expect(admin).not.toBeNull();
    expect(admin?.username).toBe(adminName);
    expect(admin?.password).toBeUndefined();
  });
  test("findById should find existing admin", async () => {
    const newAdminName = "newAdmin2";
    const newAdminPw = "newAdminPw2";
    const notFoundAdmin = await AdminService.findById("");
    expect(notFoundAdmin).toBeNull();
    const admin = await AdminService.findOrCreate(newAdminName, newAdminPw);
    const foundAdmin = await AdminService.findById(admin.id);
    expect(foundAdmin).not.toBeNull();
    expect(foundAdmin?.username).toBe(newAdminName);
    expect(foundAdmin?.password).toBeUndefined();
  });

  test("getAll should return all admins", async () => {
    const admins = await AdminService.getAll();
    expect(admins.length).toBe(0);
    await AdminService.findOrCreate(adminName, adminPw);
    const admins2 = await AdminService.getAll();
    expect(admins2.length).toBe(1);
  });

  test("getTrend should return 0 if no admins were added", async () => {
    expect(await AdminService.getTrend()).toBe(0);
  });

  test("getTrend should return 1 if one admin was added", async () => {
    await AdminService.findOrCreate(adminName, adminPw);
    expect(await AdminService.getTrend()).toBe(1);
  });

  test("update should update admin", async () => {
    const admin = await AdminService.findOrCreate(adminName, adminPw);
    const newAdminName = "updatedAdmin";
    await AdminService.update(admin.id, { username: newAdminName });
    const updatedAdmin = await AdminService.findById(admin.id);
    expect(updatedAdmin?.username).toBe(newAdminName);
  });

  test("update on non-existing admin should throw", async () => {
    expect(() =>
      AdminService.update("non-existing-id", { username: "x" })
    ).rejects.toThrow();
  });

  test("remove should delete admin", async () => {
    const admin = await AdminService.findOrCreate(adminName, adminPw);
    expect(await AdminService.getCount()).toBe(1);
    await AdminService.remove(admin.id);
    expect(await AdminService.getCount()).toBe(0);
  });

  test("remove on non-existing admin should throw", async () => {
    expect(() => AdminService.remove("non-existing-id")).rejects.toThrow();
  });
});
