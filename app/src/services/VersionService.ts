import { debug, error } from "@/utils/logging";
import ax from "./RequestService";
import ERROR_CODES from "@/utils/error_codes";
import { isPrerender } from "@/utils/isPrerender";
import env from "../utils/env";

interface VersionEntry {
  tag: string;
  start: Date | null;
  end: Date | null;
}

/**
 * List of application versions with their active periods.
 *
 * @type {Array<{tag: string, start: Date|null, end: Date|null}>}
 */
const VERSIONS: VersionEntry[] = [
  {
    tag: "0.10.3",
    start: null,
    end: new Date(2025, 6, 15),
  },
  {
    tag: "0.11.0",
    start: null,
    end: new Date(2025, 6, 15),
  },
  {
    tag: "0.13",
    start: null,
    end: new Date(2026, 7, 15),
  },
  {
    tag: "1.0.0",
    start: null,
    end: null,
  },
];

/**
 * Service for managing application and server versions.
 * @class VersionService
 */
class VersionService {
  serverVersion: string | null = null;

  /**
   * Check if a version tag is considered new.
   * @param {string} versionTag - Version tag to check
   * @returns {boolean} True if the version is new, false otherwise
   */
  isVersionNew(versionTag: string): boolean {
    const versionData = VERSIONS.find((v) => v.tag == versionTag);
    if (!versionData) return false;

    if (versionData.start && Date.now() < versionData.start.getTime())
      return false;
    if (versionData.end && Date.now() > versionData.end.getTime()) return false;

    return true;
  }

  /**
   * Get the current app version from environment variables.
   * @returns {string} App version
   */
  getAppVersion(): string {
    return env.VITE_VERSION as string;
  }

  /**
   * Get the current server version from the API.
   * @returns {Promise<string|null>} Server version or null if unavailable
   */
  async getServerVersion(): Promise<string | null> {
    debug("Querying serverVersion", { serverVersion: this.serverVersion });
    if (this.serverVersion) return this.serverVersion;

    if (isPrerender()) {
      debug("Prerendering detected, skipping server version query");
      return null;
    }

    return ax
      .get("/version")
      .then((res) => {
        debug("Successfully queried server version");
        this.serverVersion = res.data as string;
        return res.data as string;
      })
      .catch((e: Error) => {
        error(e, ERROR_CODES.VERSION_QUERY_FAILED);
        return null;
      });
  }

  /** Reset the cached server version */
  resetCache(): void {
    this.serverVersion = null;
  }
}

export default new VersionService();
