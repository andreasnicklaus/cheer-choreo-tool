import { debug, error } from "@/utils/logging";
import ax from "./RequestService";
import ERROR_CODES from "@/utils/error_codes";
import { isPrerender } from "@/utils/isPrerender";
import env from "../utils/env";

/**
 * List of application versions with their active periods.
 *
 * @type {Array<{tag: string, start: Date|null, end: Date|null}>}
 */
const VERSIONS = [
  {
    tag: "0.10.3",
    start: null,
    end: new Date(2025, 6, 15), // July 15th 2025
  },
  {
    tag: "0.11.0",
    start: null,
    end: new Date(2025, 6, 15), // July 15th 2025
  },
];

/**
 * Service for managing application and server versions.
 * @class VersionService
 */
class VersionService {
  serverVersion = null;

  /**
   * Check if a version tag is considered new.
   * @param {string} versionTag - Version tag to check
   * @returns {boolean} True if the version is new, false otherwise
   */
  isVersionNew(versionTag) {
    const versionData = VERSIONS.find((v) => v.tag == versionTag);
    if (!versionData) return false;

    if (versionData.start && Date.now() < versionData.start) return false;
    if (versionData.end && Date.now() > versionData.end) return false;

    return true;
  }

  /**
   * Get the current app version from environment variables.
   * @returns {string} App version
   */
  getAppVersion() {
    return env.VITE_VERSION;
  }

  /**
   * Get the current server version from the API.
   * @returns {Promise<string|null>} Server version or null if unavailable
   */
  async getServerVersion() {
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
        this.serverVersion = res.data;
        return res.data;
      })
      .catch((e) => {
        error(e, ERROR_CODES.VERSION_QUERY_FAILED);
        return null;
      });
  }

  /** Reset the cached server version */
  resetCache() {
    this.serverVersion = null;
  }
}

export default new VersionService();
