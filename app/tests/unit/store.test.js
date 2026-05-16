import store from "@/store";
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";

describe("store", () => {
  beforeEach(() => {
    store.replaceState({
      loggedIn: false,
      clubId: null,
      isMobile: true,
    });
  });

  describe("getters", () => {
    describe("isChristmasTime", () => {
      beforeAll(() => {
        vi.useFakeTimers("modern");
      });
      afterAll(() => {
        vi.useRealTimers();
      });

      test("isChristmasTime should return true for 25th of december", () => {
        vi.setSystemTime(new Date("2023-12-25"));
        expect(store.getters.isChristmasTime).toBeTruthy();
      });
      test("isChristmasTime should return false for 30 of november", () => {
        vi.setSystemTime(new Date("2023-11-30"));
        expect(store.getters.isChristmasTime).toBeFalsy();
      });
      test("isChristmasTime should return false for 28th of december", () => {
        vi.setSystemTime(new Date("2023-12-28"));
        expect(store.getters.isChristmasTime).toBeFalsy();
      });
    });
    describe("isEasterTime", () => {
      beforeAll(() => {
        vi.useFakeTimers("modern");
      });
      afterAll(() => {
        vi.useRealTimers();
      });

      test("isEasterTime should return true for 21st of march", () => {
        vi.setSystemTime(new Date("2023-03-21"));
        expect(store.getters.isEasterTime).toBeTruthy();
      });
      test("isEasterTime should return false for 19th of march", () => {
        vi.setSystemTime(new Date("2023-03-19"));
        expect(store.getters.isEasterTime).toBeFalsy();
      });
      test("isEasterTime should return false for 1st of may", () => {
        vi.setSystemTime(new Date("2023-05-01"));
        expect(store.getters.isEasterTime).toBeFalsy();
      });
    });
  });

  describe("mutations", () => {
    test("setLoginState should set loggedIn to true", () => {
      store.commit("setLoginState", true);
      expect(store.state.loggedIn).toBeTruthy();
    });

    test("setLoginState should set loggedIn to false and clubId to null", () => {
      store.commit("setLoginState", false);
      expect(store.state.loggedIn).toBeFalsy();
      expect(store.state.clubId).toBeNull();
    });

    test("setClubId should set clubId to the given id", () => {
      const clubId = "12345";
      store.commit("setClubId", clubId);
      expect(store.state.clubId).toBe(clubId);
    });

    test("setMobile should set isMobile to the given value", () => {
      store.commit("setMobile", false);
      expect(store.state.isMobile).toBeFalsy();
    });
  });
});
