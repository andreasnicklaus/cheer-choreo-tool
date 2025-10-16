import seed from "@/db/seed";
import { describe, expect, test } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
  dbLogger: {
    debug: jest.fn(),
  },
  logger: {
    debug: jest.fn(),
  },
}));

jest.mock("@/plugins/nodemailer", () => ({
  sendMail: jest.fn(),
  verify: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/db/db", () => {
  return new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
});

jest.mock("@/db/seed", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("db/index", () => {
  test("should run", async () => {
    process.env.IsTest = "false";
    const { syncPromise } = require("@/db");
    await syncPromise;
    expect(seed).toHaveBeenCalledTimes(1);
  });
});
