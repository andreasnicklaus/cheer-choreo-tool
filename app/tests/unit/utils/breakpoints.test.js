import state from "@/utils/breakpoints";
import { test, expect, describe } from "@jest/globals";

describe("breakpoints", () => {
  test("state has screen property", () => {
    expect(Object.keys(state).includes("screen")).toBeTruthy();
  });
  test("screen width is equal to default", () => {
    expect(state.screen.width).toEqual(1900);
  });
  test("screen mobile is false by default", () => {
    expect(state.screen.mobile).toBeFalsy();
  });
  test("screen xs is false by default", () => {
    expect(state.screen.xs).toBeFalsy();
  });
  test("screen sm is false by default", () => {
    expect(state.screen.sm).toBeFalsy();
  });
  test("screen md is false by default", () => {
    expect(state.screen.md).toBeFalsy();
  });
  test("screen lg is false by default", () => {
    expect(state.screen.lg).toBeFalsy();
  });
  test("screen xl is true by default", () => {
    expect(state.screen.xl).toBeTruthy();
  });
  test("screen.gt.xs is true by default", () => {
    expect(state.screen.gt.xs).toBeTruthy();
  });
  test("screen.gt.sm is true by default", () => {
    expect(state.screen.gt.sm).toBeTruthy();
  });
  test("screen.gt.md is true by default", () => {
    expect(state.screen.gt.md).toBeTruthy();
  });
  test("screen.gt.lg is true by default", () => {
    expect(state.screen.gt.lg).toBeTruthy();
  });
  test("screen.gt.xl is true by default", () => {
    expect(state.screen.gt.xl).toBeTruthy();
  });
  test("screen.lt.xs is false by default", () => {
    expect(state.screen.lt.xs).toBeFalsy();
  });
  test("screen.lt.sm is false by default", () => {
    expect(state.screen.lt.sm).toBeFalsy();
  });
  test("screen.lt.md is false by default", () => {
    expect(state.screen.lt.md).toBeFalsy();
  });
  test("screen.lt.lg is false by default", () => {
    expect(state.screen.lt.lg).toBeFalsy();
  });
  test("screen.lt.xl is true by default", () => {
    expect(state.screen.lt.xl).toBeTruthy();
  });
});
