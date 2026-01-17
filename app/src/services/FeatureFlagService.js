import { debug, warn } from "@/utils/logging";
import { UnleashClient } from "unleash-proxy-client";

const FEATURE_FLAG_API_KEY = process.env.VUE_APP_FEATURE_FLAG_API_KEY;

const unleash = new UnleashClient({
  url: "https://features.choreo-planer.de/api/frontend",
  clientKey: FEATURE_FLAG_API_KEY,
  appName: "choreo-planer-ui",
});

export const FeatureFlagKeys = {
  MOBILE_EDITING: "mobile-editing",
  SOCIAL_LOGIN: "social-login",
};

class FeatureFlagService {
  constructor() {
    this.unleash = unleash;
    // Start the background polling
    this.initialization = this.unleash.start();
  }

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
