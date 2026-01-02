import { Page } from "@playwright/test";

export function mockTrackingRequests(page: Page) {
  return page.route("https://matomo.choreo-planer.de/matomo.php**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });
}
