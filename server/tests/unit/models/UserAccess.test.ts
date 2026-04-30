import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Sequelize } from "sequelize";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  info: jest.fn(),
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

jest.mock("i18n", () => ({
  __: jest
    .fn()
    .mockImplementation((opts: { phrase?: string } | string | undefined) => {
      if (
        opts &&
        typeof opts === "object" &&
        (opts as { phrase?: string }).phrase
      ) {
        return (opts as { phrase: string }).phrase;
      }
      return "mocked";
    }),
  configure: jest.fn(),
}));

import User from "@/db/models/user";
import UserAccess from "@/db/models/userAccess";
import { AccessRole } from "@/db/models/userAccess";

describe("UserAccess Model", () => {
  let owner: User;
  let child: User;

  beforeAll(async () => {
    const { syncPromise } = require("@/db");
    await syncPromise;
  });

  beforeEach(async () => {
    owner = await User.create({ username: "ownerUser", password: "password" });
    child = await User.create({ username: "childUser", password: "password" });
  });

  afterEach(async () => {
    await UserAccess.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  test("can create access with coach role", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    expect(access).toBeDefined();
    expect(access.role).toBe(AccessRole.COACH);
    expect(access.enabled).toBe(true);
  });

  test("can create access with assistant role", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.ASSISTANT,
      enabled: true,
    });

    expect(access.role).toBe(AccessRole.ASSISTANT);
  });

  test("can create access with athlete role", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.ATHLETE,
      enabled: true,
    });

    expect(access.role).toBe(AccessRole.ATHLETE);
  });

  test("owner can have multiple children", async () => {
    const child2 = await User.create({
      username: "child2",
      password: "password",
    });

    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child2.id,
      role: AccessRole.ATHLETE,
      enabled: true,
    });

    const children = await UserAccess.findAll({
      where: { ownerUserId: owner.id },
    });

    expect(children.length).toBe(2);
  });

  test("child can have multiple owners", async () => {
    const owner2 = await User.create({
      username: "owner2",
      password: "password",
    });

    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });
    await UserAccess.create({
      ownerUserId: owner2.id,
      childUserId: child.id,
      role: AccessRole.ASSISTANT,
      enabled: true,
    });

    const accesses = await UserAccess.findAll({
      where: { childUserId: child.id },
    });

    expect(accesses.length).toBe(2);
  });

  test("can enable/disable access", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    expect(access.enabled).toBe(true);

    await access.update({ enabled: false });
    const updated = await UserAccess.findByPk(access.id);
    expect(updated?.enabled).toBe(false);
  });

  test("can query children of an owner", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    const children = await UserAccess.findAll({
      where: { ownerUserId: owner.id },
    });

    expect(children.length).toBe(1);
    expect(children[0].childUserId).toBe(child.id);
  });

  test("can query owner of a child", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    const accesses = await UserAccess.findAll({
      where: { childUserId: child.id },
    });

    expect(accesses.length).toBe(1);
    expect(accesses[0].ownerUserId).toBe(owner.id);
  });

  test("cannot create duplicate owner-child pair", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    await expect(
      UserAccess.create({
        ownerUserId: owner.id,
        childUserId: child.id,
        role: AccessRole.ATHLETE,
        enabled: true,
      }),
    ).rejects.toThrow();
  });

  test("deleting owner removes access", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    await owner.destroy();

    const accesses = await UserAccess.findAll({
      where: { ownerUserId: owner.id },
    });

    expect(accesses.length).toBe(0);
  });

  test("deleting child removes access", async () => {
    await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    await child.destroy();

    const accesses = await UserAccess.findAll({
      where: { childUserId: child.id },
    });

    expect(accesses.length).toBe(0);
  });

  test("cannot set invalid role", async () => {
    await expect(
      UserAccess.create({
        ownerUserId: owner.id,
        childUserId: child.id,
        role: "invalid" as unknown as AccessRole,
        enabled: true,
      }),
    ).rejects.toThrow();
  });

  test("can update role", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.ATHLETE,
      enabled: true,
    });

    expect(access.role).toBe(AccessRole.ATHLETE);

    await access.update({ role: AccessRole.COACH });
    const updated = await UserAccess.findByPk(access.id);
    expect(updated?.role).toBe(AccessRole.COACH);
  });

  test("can update enabled status", async () => {
    const access = await UserAccess.create({
      ownerUserId: owner.id,
      childUserId: child.id,
      role: AccessRole.COACH,
      enabled: true,
    });

    expect(access.enabled).toBe(true);

    await access.update({ enabled: false });
    const updated = await UserAccess.findByPk(access.id);
    expect(updated?.enabled).toBe(false);
  });
});
