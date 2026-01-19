import {
  describe,
  test,
  expect,
  beforeAll,
  afterEach,
  jest,
} from "@jest/globals";

process.env.UNLEASH_API_KEY = "test-api-key";

const MOCKED_FEATURE_FLAGS = [
  { name: "mobile-editing", enabled: true, stale: false },
  { name: "social-login", enabled: false, stale: false },
];

jest.mock("unleash-client", () => ({
  initialize: jest.fn(() => ({
    on: jest.fn((_event: string, callback: () => void) => {
      callback();
    }),
    getFeatureToggleDefinitions: jest.fn(() => MOCKED_FEATURE_FLAGS),
    isEnabled: jest.fn((flagName: string) => {
      const flag = MOCKED_FEATURE_FLAGS.find((f) => f.name === flagName);
      return flag ? flag.enabled : false;
    }),
  })),
}));

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import FeatureFlagService, {
  FeatureFlagKey,
} from "@/services/FeatureFlagService";

describe("FeatureFlagService", () => {
  beforeAll(async () => {
    process.env.UNLEASH_API_KEY = "test-api-key";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isEnabled", () => {
    test("should return true when a feature flag is enabled", async () => {
      const result = await FeatureFlagService.isEnabled(
        FeatureFlagKey.MOBILE_EDITING,
      );

      expect(result).toBe(true);
    });

    test("should return false when a feature flag is disabled", async () => {
      const result = await FeatureFlagService.isEnabled(
        FeatureFlagKey.SOCIAL_LOGIN,
      );

      expect(result).toBe(false);
    });
  });

  describe("getAll", () => {
    test("should return all feature flags with correct structure", async () => {
      const result = await FeatureFlagService.getAll();

      expect(result).toEqual(
        MOCKED_FEATURE_FLAGS.map(({ name, enabled, stale }) => ({
          name,
          enabled: enabled && !stale,
        })),
      );
    });
  });
});
