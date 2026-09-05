import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterAll,
} from "@jest/globals";

jest.mock("@/db", () => ({ authenticate: jest.fn() }));
jest.mock("@/plugins/nodemailer", () => ({
  isMailConfigured: jest.fn(),
  isMailHealthy: jest.fn(),
}));
jest.mock("@/services/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    isConfigured: jest.fn(),
    isReady: jest.fn(),
    getAll: jest.fn(),
  },
}));

import db from "@/db";
import { isMailConfigured, isMailHealthy } from "@/plugins/nodemailer";
import featureFlagService from "@/services/FeatureFlagService";
import { getHealthReport } from "@/utils/healthCheck";

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("getHealthReport", () => {
  describe("overall status", () => {
    test("returns healthy when all required services are up", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.status).toBe("healthy");
      expect(report.services.database.status).toBe("healthy");
    });

    test("returns unhealthy when database is down", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockRejectedValue(
        new Error("Connection refused"),
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.status).toBe("unhealthy");
      expect(report.services.database.status).toBe("unhealthy");
      expect(report.services.database.required).toBe(true);
      expect(report.services.database.message).toBe("Connection refused");
    });

    test("returns unhealthy when database rejects with non-Error", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockRejectedValue(
        "string error",
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.status).toBe("unhealthy");
      expect(report.services.database.message).toBe("Connection failed");
    });

    test("returns degraded when mail is unhealthy but DB is healthy", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(true);
      (isMailHealthy as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.status).toBe("degraded");
      expect(report.services.database.status).toBe("healthy");
      expect(report.services.mail.status).toBe("unhealthy");
    });

    test("returns degraded when feature flags are unhealthy but DB is healthy", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(true);
      (featureFlagService.isReady as jest.Mock<() => boolean>).mockReturnValue(
        false,
      );

      const report = await getHealthReport();

      expect(report.status).toBe("degraded");
      expect(report.services.database.status).toBe("healthy");
      expect(report.services.featureFlags.status).toBe("unhealthy");
    });

    test("returns healthy when all services are unconfigured (only DB required)", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.status).toBe("healthy");
      expect(report.services.mail.status).toBe("unconfigured");
      expect(report.services.featureFlags.status).toBe("unconfigured");
      expect(report.services.logging.status).toBe("unconfigured");
    });
  });

  describe("database service", () => {
    test("marks database as required", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.database.required).toBe(true);
    });
  });

  describe("mail service", () => {
    test("reports configured and healthy when env vars are set and verify passed", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(true);
      (isMailHealthy as jest.Mock<() => boolean>).mockReturnValue(true);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.mail.status).toBe("healthy");
      expect(report.services.mail.required).toBe(false);
    });

    test("reports unhealthy when env vars are set but verify failed", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(true);
      (isMailHealthy as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.mail.status).toBe("unhealthy");
      expect(report.services.mail.message).toBe(
        "SMTP verification failed at startup",
      );
    });

    test("reports unconfigured when env vars are not set", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.mail.status).toBe("unconfigured");
    });

    test("mail is optional", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.mail.required).toBe(false);
    });
  });

  describe("feature flags service", () => {
    test("reports healthy when configured and synchronized", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(true);
      (featureFlagService.isReady as jest.Mock<() => boolean>).mockReturnValue(
        true,
      );
      (
        featureFlagService.getAll as jest.Mock<
          () => Promise<
            { name: string; enabled: boolean; description: string }[]
          >
        >
      ).mockResolvedValue([
        {
          name: "mobile-editing",
          enabled: true,
          description: "Mobile Editing",
        },
      ]);

      const report = await getHealthReport();

      expect(report.services.featureFlags.status).toBe("healthy");
      expect(report.featureFlags).toEqual([
        {
          name: "mobile-editing",
          enabled: true,
          description: "Mobile Editing",
        },
      ]);
    });

    test("reports unhealthy when configured but not yet synchronized", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(true);
      (featureFlagService.isReady as jest.Mock<() => boolean>).mockReturnValue(
        false,
      );

      const report = await getHealthReport();

      expect(report.services.featureFlags.status).toBe("unhealthy");
      expect(report.services.featureFlags.message).toBe("Not yet synchronized");
      expect(report.featureFlags).toEqual([]);
    });

    test("reports unconfigured when UNLEASH_API_KEY is not set", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.featureFlags.status).toBe("unconfigured");
      expect(report.featureFlags).toEqual([]);
    });

    test("feature flags are optional", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.featureFlags.required).toBe(false);
    });

    test("handles errors from getAll gracefully", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(true);
      (featureFlagService.isReady as jest.Mock<() => boolean>).mockReturnValue(
        true,
      );
      (
        featureFlagService.getAll as jest.Mock<
          () => Promise<
            { name: string; enabled: boolean; description: string }[]
          >
        >
      ).mockRejectedValue(new Error("API unreachable"));

      const report = await getHealthReport();

      expect(report.services.featureFlags.status).toBe("error");
      expect(report.services.featureFlags.message).toBe("API unreachable");
      expect(report.featureFlags).toEqual([]);
    });

    test("handles non-Error rejection from getAll with fallback message", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(true);
      (featureFlagService.isReady as jest.Mock<() => boolean>).mockReturnValue(
        true,
      );
      (
        featureFlagService.getAll as jest.Mock<
          () => Promise<
            { name: string; enabled: boolean; description: string }[]
          >
        >
      ).mockRejectedValue("raw string error");

      const report = await getHealthReport();

      expect(report.services.featureFlags.status).toBe("error");
      expect(report.services.featureFlags.message).toBe("Unknown error");
      expect(report.featureFlags).toEqual([]);
    });
  });

  describe("logging service", () => {
    test("reports healthy when BetterStack env vars are set", async () => {
      process.env.BETTERSTACK_LOG_SOURCE_TOKEN = "token123";
      process.env.BETTERSTACK_LOG_INGESTING_HOST = "ingest.example.com";
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.logging.status).toBe("healthy");
    });

    test("reports unconfigured when BetterStack env vars are missing", async () => {
      delete process.env.BETTERSTACK_LOG_SOURCE_TOKEN;
      delete process.env.BETTERSTACK_LOG_INGESTING_HOST;
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.logging.status).toBe("unconfigured");
    });

    test("logging is optional", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.services.logging.required).toBe(false);
    });
  });

  describe("OAuth providers", () => {
    test("returns empty array when no OAuth env vars are set", async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.FACEBOOK_APP_ID;
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.oauthProviders).toEqual([]);
    });

    test("returns google when GOOGLE_CLIENT_ID is set", async () => {
      process.env.GOOGLE_CLIENT_ID = "google-id";
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.FACEBOOK_APP_ID;
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.oauthProviders).toEqual(["google"]);
    });

    test("returns multiple providers when multiple env vars are set", async () => {
      process.env.GOOGLE_CLIENT_ID = "google-id";
      process.env.GITHUB_CLIENT_ID = "github-id";
      process.env.FACEBOOK_APP_ID = "facebook-id";
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.oauthProviders).toContain("google");
      expect(report.oauthProviders).toContain("github");
      expect(report.oauthProviders).toContain("facebook");
    });
  });

  describe("report metadata", () => {
    test("includes version string", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.version).toEqual(expect.any(String));
      expect(report.version.length).toBeGreaterThan(0);
    });

    test("includes uptime as a number", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.uptime).toEqual(expect.any(Number));
      expect(report.uptime).toBeGreaterThanOrEqual(0);
    });

    test("includes ISO timestamp", async () => {
      (db.authenticate as jest.Mock<() => Promise<void>>).mockResolvedValue(
        undefined,
      );
      (isMailConfigured as jest.Mock<() => boolean>).mockReturnValue(false);
      (
        featureFlagService.isConfigured as jest.Mock<() => boolean>
      ).mockReturnValue(false);

      const report = await getHealthReport();

      expect(report.timestamp).toEqual(expect.any(String));
      expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
    });
  });
});
