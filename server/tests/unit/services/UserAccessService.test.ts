import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import UserAccessService from "@/services/UserAccessService";
import UserAccess from "@/db/models/userAccess";
import User from "@/db/models/user";
import { AccessRole } from "@/db/models/userAccess";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
  info: jest.fn(),
}));

jest.mock("@/db/db", () => {
  const { Sequelize } = require("sequelize");
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

let owner: User;
let child: User;
let child2: User;

describe("UserAccessService", () => {
  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    owner = await User.create({
      username: "ownerUser",
      password: "password",
    });
    child = await User.create({
      username: "childUser",
      password: "password",
    });
    child2 = await User.create({
      username: "child2User",
      password: "password",
    });
  });

  afterEach(async () => {
    await UserAccess.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  test("findByOwnerAndChild finds access", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });

    const access = await UserAccessService.findByOwnerAndChild(
      owner.id,
      child.id,
    );
    expect(access).not.toBeNull();
    expect(access?.ownerUserId).toBe(owner.id);
    expect(access?.childUserId).toBe(child.id);
  });

  test("findByOwnerAndChild returns null for invalid", async () => {
    const access = await UserAccessService.findByOwnerAndChild(
      "invalid",
      "invalid",
    );
    expect(access).toBeNull();
  });

  test("getChildren returns children for owner", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child2.id,
      role: AccessRole.ATHLETE,
      enabled: true,
      accepted: false,
    });

    const children = await UserAccessService.getChildren(owner.id);
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBe(2);
  });

  test("getChildren returns empty for user with no children", async () => {
    const children = await UserAccessService.getChildren(owner.id);
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBe(0);
  });

  test("getOwners returns owners for child", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });

    const owners = await UserAccessService.getOwners(child.id);
    expect(Array.isArray(owners)).toBe(true);
    expect(owners.length).toBe(1);
    expect(owners[0].ownerUserId).toBe(owner.id);
  });

  test("getOwners returns empty for user with no owners", async () => {
    const owners = await UserAccessService.getOwners(child.id);
    expect(Array.isArray(owners)).toBe(true);
    expect(owners.length).toBe(0);
  });

  test("create creates new access", async () => {
    const access = await UserAccessService.create(
      owner.id,
      child.id,
      "coach" as AccessRole,
      true,
    );
    expect(access).toBeDefined();
    expect(access.ownerUserId).toBe(owner.id);
    expect(access.childUserId).toBe(child.id);
    expect(access.role).toBe(AccessRole.COACH);
    expect(access.enabled).toBe(true);
  });

  test("create throws for duplicate", async () => {
    await UserAccessService.create(owner.id, child.id, AccessRole.COACH);
    await expect(
      UserAccessService.create(owner.id, child.id, AccessRole.ATHLETE),
    ).rejects.toThrow();
  });

  test("update updates access", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });

    const updated = await UserAccessService.update(
      access.id,
      { role: AccessRole.ATHLETE, enabled: false },
      owner.id,
    );
    expect(updated).toBeDefined();
    expect(updated.role).toBe(AccessRole.ATHLETE);
    expect(updated.enabled).toBe(false);
  });

  test("update throws for invalid id", async () => {
    await expect(
      UserAccessService.update(
        "invalid-id",
        { role: AccessRole.ATHLETE },
        owner.id,
      ),
    ).rejects.toThrow();
  });

  test("remove deletes access", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });

    await UserAccessService.remove(access.id, owner.id);
    const found = await UserAccess.findByPk(access.id);
    expect(found).toBeNull();
  });

  test("remove throws for invalid id", async () => {
    await expect(
      UserAccessService.remove("invalid-id", owner.id),
    ).rejects.toThrow();
  });

  test("accept accepts invitation", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });

    const updated = await UserAccessService.accept(access.id, child.id);
    expect(updated).toBeDefined();
    expect(updated.accepted).toBe(true);
  });

  test("accept throws for invalid id", async () => {
    await expect(
      UserAccessService.accept("invalid-id", child.id),
    ).rejects.toThrow();
  });

  test("decline removes invitation", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: false,
    });

    await UserAccessService.decline(access.id, child.id);
    const found = await UserAccess.findByPk(access.id);
    expect(found).toBeNull();
  });

  test("decline throws for invalid id", async () => {
    await expect(
      UserAccessService.decline("invalid-id", child.id),
    ).rejects.toThrow();
  });

  test("hasAccess returns true when access exists", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
      accepted: true,
    });

    const hasAccess = await UserAccessService.hasAccess(owner.id, child.id);
    expect(hasAccess).toBe(true);
  });

  test("hasAccess returns false when access does not exist", async () => {
    const hasAccess = await UserAccessService.hasAccess(owner.id, child.id);
    expect(hasAccess).toBe(false);
  });

  test("getRole returns role when access exists", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.ASSISTANT,
      enabled: true,
      accepted: true,
    });

    const role = await UserAccessService.getRole(owner.id, child.id);
    expect(role).toBe(AccessRole.ASSISTANT);
  });

  test("getRole returns null when access does not exist", async () => {
    const role = await UserAccessService.getRole(owner.id, child.id);
    expect(role).toBeNull();
  });
});
