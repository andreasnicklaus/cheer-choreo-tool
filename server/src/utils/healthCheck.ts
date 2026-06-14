import db from "@/db";
import featureFlagService from "@/services/FeatureFlagService";
import { isMailConfigured, isMailHealthy } from "@/plugins/nodemailer";
import { isLoggingConfigured } from "@/plugins/winston";
import { formatDuration } from "@/utils/time";

const { version } = require("../../package.json");

export interface ServiceStatus {
  status: "healthy" | "unhealthy" | "unconfigured" | "error";
  required: boolean;
  message?: string;
}

export interface HealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  formattedUptime: string;
  timestamp: string;
  services: {
    database: ServiceStatus;
    mail: ServiceStatus;
    featureFlags: ServiceStatus;
    logging: ServiceStatus;
  };
  featureFlags: { name: string; enabled: boolean; description: string }[];
  oauthProviders: string[];
}

function getConfiguredOAuthProviders(): string[] {
  const providers: string[] = [];
  if (process.env.GOOGLE_CLIENT_ID) providers.push("google");
  if (process.env.GITHUB_CLIENT_ID) providers.push("github");
  if (process.env.FACEBOOK_APP_ID) providers.push("facebook");
  return providers;
}

function getLoggingStatus(): ServiceStatus {
  return {
    status: isLoggingConfigured() ? "healthy" : "unconfigured",
    required: false,
  };
}

function getMailStatus(): ServiceStatus {
  if (!isMailConfigured()) {
    return { status: "unconfigured", required: false };
  }
  if (isMailHealthy()) {
    return { status: "healthy", required: false };
  }
  return {
    status: "unhealthy",
    required: false,
    message: "SMTP verification failed at startup",
  };
}

async function getFeatureFlagStatus(): Promise<{
  status: ServiceStatus;
  flags: { name: string; enabled: boolean; description: string }[];
}> {
  if (!featureFlagService.isConfigured()) {
    return {
      status: { status: "unconfigured", required: false },
      flags: [],
    };
  }
  try {
    if (!featureFlagService.isReady()) {
      return {
        status: {
          status: "unhealthy",
          required: false,
          message: "Not yet synchronized",
        },
        flags: [],
      };
    }
    const flags = await featureFlagService.getAll();
    return {
      status: { status: "healthy", required: false },
      flags,
    };
  } catch (error) {
    return {
      status: {
        status: "error",
        required: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      flags: [],
    };
  }
}

async function getDatabaseStatus(): Promise<ServiceStatus> {
  try {
    await db.authenticate();
    return { status: "healthy", required: true };
  } catch (error) {
    return {
      status: "unhealthy",
      required: true,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

export async function getHealthReport(): Promise<HealthReport> {
  const dbStatus = await getDatabaseStatus();
  const mailStatus = getMailStatus();
  const loggingStatus = getLoggingStatus();
  const { status: ffStatus, flags } = await getFeatureFlagStatus();
  const oauthProviders = getConfiguredOAuthProviders();

  let overallStatus: HealthReport["status"] = "healthy";
  if (dbStatus.status === "unhealthy") {
    overallStatus = "unhealthy";
  } else if (
    dbStatus.status === "healthy" &&
    (mailStatus.status === "unhealthy" || ffStatus.status === "unhealthy")
  ) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    version,
    uptime: Math.floor(process.uptime()),
    formattedUptime: formatDuration(Math.floor(process.uptime())),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      mail: mailStatus,
      featureFlags: ffStatus,
      logging: loggingStatus,
    },
    featureFlags: flags,
    oauthProviders,
  };
}
