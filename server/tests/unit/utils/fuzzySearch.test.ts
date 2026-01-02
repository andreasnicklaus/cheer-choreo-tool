import search from "@/utils/fuzzySearch";
import { describe, expect, test } from "@jest/globals";

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
}));
describe("fuzzySearch", () => {
  test("search returns somewhat similar items", () => {
    const data = [
      {
        name: "test1",
        description: "this is a test",
      },
      {
        name: "test2",
        description: "this is is an example",
      },
      {
        name: "example",
        description: "this is a test",
      },
      {
        name: "example",
        description: "this is an example",
      },
    ];
    expect(search(data, { keys: ["name"] }, "test")).toEqual([
      {
        name: "test1",
        description: "this is a test",
      },
      {
        name: "test2",
        description: "this is is an example",
      },
    ]);
  });
});
