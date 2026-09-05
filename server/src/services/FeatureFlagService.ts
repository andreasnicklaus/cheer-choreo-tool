import logger from "@/plugins/winston";
import { initialize, Unleash } from "unleash-client";

/**
 * Keys for available feature flags used by the application.
 */
export enum FeatureFlagKey {
  MOBILE_EDITING = "mobile-editing",
  SOCIAL_LOGIN = "social-login",
  ACCESS_SHARING = "access-sharing",
}

/**
 * Service responsible for initializing and querying feature flags.
 *
 * This service initializes the client once and exposes helper
 * methods to validate configuration and to read feature flag values.
 */
class FeatureFlagService {
  initialization: Promise<void>;
  unleash: ReturnType<typeof initialize>;
  private _ready = false;

  /**
   * Create a new FeatureFlagService and start initialization.
   * The `initialization` promise resolves when the client emits
   * the `synchronized` event.
   */
  constructor() {
    this.unleash = {} as Unleash; // only for type safety

    if (!process.env.UNLEASH_API_KEY) {
      this._ready = false;
      this.initialization = Promise.resolve();
      return;
    }

    this.initialization = new Promise((resolve) => {
      this.unleash = initialize({
        url: "https://features.choreo-planer.de/api",
        appName: "choreo-planer-server",
        customHeaders: {
          Authorization: process.env.UNLEASH_API_KEY ?? "",
        },
      });

      this.unleash.on("synchronized", () => {
        this._ready = true;
        resolve();
      });
    });
  }

  isConfigured(): boolean {
    return !!process.env.UNLEASH_API_KEY;
  }

  isReady(): boolean {
    return this._ready;
  }

  /**
   * Check whether a feature flag is enabled.
   *
   * Waits for the client to finish initialization before querying.
   * Returns `false` when feature flags are not configured.
   *
   * @param {FeatureFlagKey} flagName - The feature flag key to check.
   * @returns {Promise<boolean>} True if the flag is enabled; otherwise false.
   */
  async isEnabled(flagName: FeatureFlagKey) {
    if (!this.isConfigured()) {
      logger.warn(
        `FeatureFlagService.isEnabled "${flagName}" — UNLEASH_API_KEY not set, returning false`,
      );
      return false;
    }
    logger.debug(`FeatureFlagService.isEnabled "${flagName}"`);
    await this.initialization;
    const result = this.unleash.isEnabled(flagName);
    logger.debug(
      `Feature flag "${flagName}" is ${result ? "enabled" : "disabled"}`,
    );
    return result;
  }

  /**
   * Retrieve all feature flag definitions.
   *
   * Filters out stale flags and returns an array of simplified flag states.
   * Returns an empty array when feature flags are not configured.
   *
   * @returns {Promise<Array<{name: string, enabled: boolean}>>}
   *          Array of feature flag states.
   */
  async getAll() {
    if (!this.isConfigured()) {
      logger.warn(
        "FeatureFlagService.getAll — UNLEASH_API_KEY not set, returning empty array",
      );
      return [];
    }
    logger.debug(`FeatureFlagService.getAll`);
    await this.initialization;
    const result = this.unleash.getFeatureToggleDefinitions();
    logger.debug(`Feature Flags: ${JSON.stringify(result)}`);
    return result.map(({ name, enabled, stale, description }) => ({
      name,
      enabled: enabled && !stale,
      description: description || name,
    }));
  }
}

export default new FeatureFlagService();
