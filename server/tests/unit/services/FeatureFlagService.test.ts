import {
  describe,
  test,
  expect,
  beforeAll,
  afterEach,
  jest,
} from "@jest/globals";
import logger from "@/plugins/winston";

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

const UNLEASH_API_KEY_VALUE = process.env.UNLEASH_API_KEY;

describe("FeatureFlagService", () => {
  beforeAll(async () => {
    process.env.UNLEASH_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.UNLEASH_API_KEY = UNLEASH_API_KEY_VALUE;
    jest.clearAllMocks();
  });

  describe("isConfigured", () => {
    test("should return true when UNLEASH_API_KEY is set", () => {
      process.env.UNLEASH_API_KEY = "some-key";
      const result = FeatureFlagService.isConfigured();
      expect(result).toBe(true);
    });

    test("should return false when UNLEASH_API_KEY is not set", () => {
      delete process.env.UNLEASH_API_KEY;
      const result = FeatureFlagService.isConfigured();
      expect(result).toBe(false);
    });

    test("should return false when UNLEASH_API_KEY is empty", () => {
      process.env.UNLEASH_API_KEY = "";
      const result = FeatureFlagService.isConfigured();
      expect(result).toBe(false);
    });
  });

  describe("isReady", () => {
    test("should return true after synchronization event", () => {
      const result = FeatureFlagService.isReady();
      expect(result).toBe(true);
    });
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

    test("should return false and log warning when not configured", async () => {
      delete process.env.UNLEASH_API_KEY;

      const result = await FeatureFlagService.isEnabled(
        FeatureFlagKey.MOBILE_EDITING,
      );

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    test("should return all feature flags with correct structure", async () => {
      const result = await FeatureFlagService.getAll();

      expect(result).toEqual(
        MOCKED_FEATURE_FLAGS.map(({ name, enabled, stale }) => ({
          name,
          enabled: enabled && !stale,
          description: name,
        })),
      );
    });

    test("should return empty array and log warning when not configured", async () => {
      delete process.env.UNLEASH_API_KEY;

      const result = await FeatureFlagService.getAll();

      expect(result).toEqual([]);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
