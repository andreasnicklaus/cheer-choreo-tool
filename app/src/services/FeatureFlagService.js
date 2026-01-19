import { debug, warn } from "@/utils/logging";
import { UnleashClient } from "unleash-proxy-client";

const FEATURE_FLAG_API_KEY = process.env.VUE_APP_FEATURE_FLAG_API_KEY;

const unleash = new UnleashClient({
  url: "https://features.choreo-planer.de/api/frontend",
  clientKey: FEATURE_FLAG_API_KEY,
  appName: "choreo-planer-ui",
});

/**
 * Known feature flag keys used by the UI.
 * @readonly
 * @enum {string}
 */
export const FeatureFlagKeys = {
  MOBILE_EDITING: "mobile-editing",
  SOCIAL_LOGIN: "social-login",
};

/**
 * Client-side FeatureFlagService using the a proxy client.
 *
 * The service starts the client once and exposes helper methods
 * to check whether flags are enabled. Consumers should await the
 * initialization before querying flags to ensure the client has fetched
 * the current toggle state.
 */
class FeatureFlagService {
  /**
   * Initialize the service and start background polling.
   * @constructor
   */
  constructor() {
    this.unleash = unleash;
    // Start the background polling
    this.initialization = this.unleash.start();
  }

  /**
   * Check whether a feature flag is enabled.
   *
   * Waits for the client to finish initial startup before querying.
   * Logs a warning for unknown flags.
   *
   * @param {string} flagName - The feature flag key to check.
   * @returns {Promise<boolean>} Resolves to true when the flag is enabled.
   */
  async isEnabled(flagName) {
    await this.initialization;
    if (!Object.values(FeatureFlagKeys).includes(flagName))
      warn(`Unknown feature flag: ${flagName}`);
    const result = this.unleash.isEnabled(flagName);
    debug(`Feature flag "${flagName}" is ${result ? "enabled" : "disabled"}`);
    return result;
  }
}

export default new FeatureFlagService();
