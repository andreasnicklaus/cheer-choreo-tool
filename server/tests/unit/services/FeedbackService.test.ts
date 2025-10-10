import { describe, test, expect } from "@jest/globals";
import FeedbackService from "@/services/FeedbackService";
import Feedback from "@/db/models/feedback";
import User from "@/db/models/user";

jest.mock("@/plugins/winston", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  debug: jest.fn(),
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

let user = { id: "test-id" };

describe("FeedbackService", () => {
  beforeAll(async () => {
    process.env.IsTest = "true";
    const { syncPromise } = require("@/db");
    await syncPromise;

    user = await User.create({
      username: "test-user",
      password: "test-password",
      email: "test@choreo-planer.de",
    });
  });

  afterEach(async () => {
    await Feedback.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  test("create creates feedback", async () => {
    const result = await FeedbackService.create(5, "Great!", user.id);
    expect(result).toBeDefined();
    expect(result.stars).toBe(5);
    expect(result.text).toBe("Great!");
    expect(result.UserId).toBe(user.id);
  });

  test("getAll returns feedbacks for valid user", async () => {
    await Feedback.create({ stars: 5, text: "Great!", UserId: user.id });
    const result = await FeedbackService.getAll(user.id);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test("getAll returns empty for invalid user", async () => {
    const result = await FeedbackService.getAll("invalid-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("getNewest returns newest feedback", async () => {
    await Feedback.create({
      stars: 5,
      text: "Great!",
      UserId: user.id,
      createdAt: new Date(),
    });
    const result = await FeedbackService.getNewest();
    expect(result).toBeDefined();
    expect(result.stars).toBe(5);
    expect(result.text).toBe("Great!");
  });

  test("getTotalAverage returns correct average for multiple feedbacks", async () => {
    await Feedback.create({ stars: 4, text: "Good", UserId: user.id });
    await Feedback.create({ stars: 2, text: "Bad", UserId: user.id });
    const avg = await FeedbackService.getTotalAverage();
    expect(avg).toBeCloseTo(3, 1);
  });

  test("getTotalAverage returns NaN if no feedbacks exist", async () => {
    const avg = await FeedbackService.getTotalAverage();
    expect(Number.isNaN(avg)).toBe(true);
  });

  test("getAverageOfLastMonth returns correct average for recent feedbacks", async () => {
    await Feedback.create({
      stars: 5,
      text: "Recent",
      UserId: user.id,
      createdAt: new Date(),
    });
    await Feedback.create({
      stars: 1,
      text: "Old",
      UserId: user.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
    });
    const avg = await FeedbackService.getAverageOfLastMonth();
    expect(avg).toBeCloseTo(5, 1);
  });

  test("getAverageOfLastMonth returns NaN if no recent feedbacks exist", async () => {
    await Feedback.create({
      stars: 2,
      text: "Old",
      UserId: user.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
    });
    const avg = await FeedbackService.getAverageOfLastMonth();
    expect(Number.isNaN(avg)).toBe(true);
  });
});
