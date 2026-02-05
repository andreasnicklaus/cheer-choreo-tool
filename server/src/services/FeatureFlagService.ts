import logger from "@/plugins/winston";
import { initialize, Unleash } from "unleash-client";

/**
 * Keys for available feature flags used by the application.
 */
export enum FeatureFlagKey {
  MOBILE_EDITING = "mobile-editing",
  SOCIAL_LOGIN = "social-login",
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

  /**
   * Create a new FeatureFlagService and start initialization.
   * The `initialization` promise resolves when the client emits
   * the `synchronized` event.
   */
  constructor() {
    this.unleash = {} as Unleash; // only for type safety
    const UNLEASH_API_KEY = process.env.UNLEASH_API_KEY;

    this.initialization = new Promise((resolve) => {
      this.unleash = initialize({
        url: "https://features.choreo-planer.de/api",
        appName: "choreo-planer-server",
        customHeaders: {
          Authorization: UNLEASH_API_KEY ?? "",
        },
      });

      this.unleash.on("synchronized", resolve);
    });
  }

  /**
   * Validate that required environment variables are present.
   *
   * @throws {Error} If api key is not set.
   * @returns {true} When validation passes.
   */
  static validate() {
    const UNLEASH_API_KEY = process.env.UNLEASH_API_KEY;

    if (!UNLEASH_API_KEY) {
      throw new Error("UNLEASH_API_KEY is not set in environment variables");
    }
    return true;
  }

  /**
   * Check whether a feature flag is enabled.
   *
   * Waits for the client to finish initialization before querying.
   *
   * @param {FeatureFlagKey} flagName - The feature flag key to check.
   * @returns {Promise<boolean>} True if the flag is enabled; otherwise false.
   */
  async isEnabled(flagName: FeatureFlagKey) {
    FeatureFlagService.validate();
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
   *
   * @returns {Promise<Array<{name: string; enabled: boolean}>>}
   *          Array of feature flag states.
   */
  async getAll() {
    FeatureFlagService.validate();
    logger.debug(`FeatureFlagService.getAll`);
    await this.initialization;
    const result = this.unleash.getFeatureToggleDefinitions();
    logger.debug(`Feature Flags: ${JSON.stringify(result)}`);
    return result.map(({ name, enabled, stale }) => ({
      name,
      enabled: enabled && !stale,
    }));
  }
}

export default new FeatureFlagService();
