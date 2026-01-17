import logger from '@/plugins/winston';
import { initialize, Unleash } from 'unleash-client';

const UNLEASH_API_KEY = process.env.UNLEASH_API_KEY;

if (!UNLEASH_API_KEY) {
  throw new Error('UNLEASH_API_KEY is not set in environment variables');
}

export enum FeatureFlagKey {
  MOBILE_EDITING = "mobile-editing",
  SOCIAL_LOGIN = "social-login",
};

class FeatureFlagService {
  initialization: Promise<void>;
  unleash: ReturnType<typeof initialize>

  constructor() {
    this.unleash = {} as Unleash; // only for type safety
    this.initialization = new Promise((resolve) => {
      this.unleash = initialize({
        url: 'https://features.choreo-planer.de/api',
        appName: 'choreo-planer-server',
        customHeaders: {
          Authorization: UNLEASH_API_KEY ?? '',
        }
      });

      this.unleash.on("synchronized", resolve)
    })
  }

  async isEnabled(flagName: FeatureFlagKey) {
    logger.debug(`FeatureFlagService.isEnabled "${flagName}"`);
    await this.initialization;
    const result = this.unleash.isEnabled(flagName);
    logger.debug(`Feature flag "${flagName}" is ${result ? "enabled" : "disabled"}`);
    return result;
  }

  async getAll() {
    logger.debug(`FeatureFlagService.getAll`);
    await this.initialization;
    const result = this.unleash.getFeatureToggleDefinitions();
    logger.debug(`Feature Flags: ${JSON.stringify(result)}`);
    return result.map(({ name, enabled, stale }) => ({ name, enabled: enabled && !stale }));
  }
}

export default new FeatureFlagService();