import { describe } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  dbLogger: {
    debug: jest.fn(),
  },
}));

describe("db init module", () => {
  test("db init does not throw", () => {
    expect(() => require("@/db/db")).not.toThrow();
  });
});
