import store from "@/store";
import AuthService from "@/services/AuthService";
import FeatureFlagService, {
  FeatureFlagKeys,
} from "@/services/FeatureFlagService";
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";

vi.mock("@/services/AuthService", () => ({
  default: {
    getUserInfo: vi.fn(),
  },
}));

vi.mock("@/services/FeatureFlagService", () => ({
  default: {
    isEnabled: vi.fn(),
  },
  FeatureFlagKeys: {
    ACCESS_SHARING: "ACCESS_SHARING",
  },
}));

describe("store", () => {
  beforeEach(() => {
    store.replaceState({
      loggedIn: false,
      clubId: null,
      isMobile: true,
      owners: [],
      ownersLoaded: false,
      me: null,
    });
    vi.clearAllMocks();
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

    test("setOwners should set owners and mark ownersLoaded as true", () => {
      const testOwners = [{ id: "1", name: "Test Owner" }];
      store.commit("setOwners", testOwners);
      expect(store.state.owners).toEqual(testOwners);
      expect(store.state.ownersLoaded).toBe(true);
    });

    test("clearOwners should reset owners and ownersLoaded", () => {
      store.replaceState({
        ...store.state,
        owners: [{ id: "1" }],
        ownersLoaded: true,
      });
      store.commit("clearOwners");
      expect(store.state.owners).toEqual([]);
      expect(store.state.ownersLoaded).toBe(false);
    });

    test("setMe should set the me state", () => {
      const testMe = { username: "testuser", email: "test@test.com" };
      store.commit("setMe", testMe);
      expect(store.state.me).toEqual(testMe);
    });

    test("clearMe should reset me to null", () => {
      store.replaceState({
        ...store.state,
        me: { username: "testuser" },
      });
      store.commit("clearMe");
      expect(store.state.me).toBeNull();
    });
  });

  describe("actions", () => {
    describe("loadUserInfo", () => {
      test("should load user info and set owners when access sharing is enabled", async () => {
        const mockMe = {
          username: "testuser",
          childAccess: [
            { enabled: true, name: "Owner 1" },
            { enabled: false, name: "Owner 2" },
          ],
        };
        AuthService.getUserInfo.mockResolvedValue(mockMe);
        FeatureFlagService.isEnabled.mockResolvedValue(true);

        await store.dispatch("loadUserInfo");

        expect(AuthService.getUserInfo).toHaveBeenCalledWith(true);
        expect(FeatureFlagService.isEnabled).toHaveBeenCalledWith(
          FeatureFlagKeys.ACCESS_SHARING
        );
        expect(store.state.me).toEqual(mockMe);
        expect(store.state.owners).toEqual([{ enabled: true, name: "Owner 1" }]);
        expect(store.state.ownersLoaded).toBe(true);
      });

      test("should load user info and set empty owners when access sharing is disabled", async () => {
        const mockMe = {
          username: "testuser",
          childAccess: [{ enabled: true, name: "Owner 1" }],
        };
        AuthService.getUserInfo.mockResolvedValue(mockMe);
        FeatureFlagService.isEnabled.mockResolvedValue(false);

        await store.dispatch("loadUserInfo");

        expect(store.state.me).toEqual(mockMe);
        expect(store.state.owners).toEqual([]);
        expect(store.state.ownersLoaded).toBe(true);
      });

      test("should handle missing childAccess gracefully", async () => {
        const mockMe = { username: "testuser" };
        AuthService.getUserInfo.mockResolvedValue(mockMe);
        FeatureFlagService.isEnabled.mockResolvedValue(true);

        await store.dispatch("loadUserInfo");

        expect(store.state.owners).toEqual([]);
      });

      test("should clear me and owners on error", async () => {
        AuthService.getUserInfo.mockRejectedValue(new Error("Failed"));
        store.replaceState({
          ...store.state,
          me: { username: "existing" },
          owners: [{ id: "1" }],
          ownersLoaded: true,
        });

        await store.dispatch("loadUserInfo");

        expect(store.state.me).toBeNull();
        expect(store.state.owners).toEqual([]);
        expect(store.state.ownersLoaded).toBe(false);
      });
    });
  });
});
