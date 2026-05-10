import { Page } from "@playwright/test";

export function mockFeatureFlagRequests(page: Page) {
  return page.route("https://features.choreo-planer.de/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        toggles: [
          // Comment out to disable the feature flag
          // {
          //   "name": "mobile-editing",
          //   "enabled": true,
          //   "variant": {
          //     "name": "disabled",
          //     "enabled": false,
          //     "feature_enabled": true,
          //     "featureEnabled": true
          //   },
          //   "impressionData": true
          // },
          {
            name: "access-sharing",
            enabled: true,
            variant: {
              name: "disabled",
              enabled: false,
              feature_enabled: true,
              featureEnabled: true,
            },
            impressionData: true,
          },
          {
            name: "contact-with-login",
            enabled: true,
            variant: {
              name: "disabled",
              enabled: false,
              feature_enabled: true,
              featureEnabled: true,
            },
            impressionData: true,
          },
          {
            name: "contact-without-login",
            enabled: true,
            variant: {
              name: "disabled",
              enabled: false,
              feature_enabled: true,
              featureEnabled: true,
            },
            impressionData: true,
          },
        ],
      }),
    });
  });
}
