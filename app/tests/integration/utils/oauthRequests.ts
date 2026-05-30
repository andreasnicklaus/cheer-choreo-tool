import { Page } from "@playwright/test";

const API_URL = "https://api.choreo-planer.de";
const APP_URL = "http://localhost:3001";

export async function mockOAuthProviderRequest(
  page: Page,
  provider: string,
  token: string = "test-jwt-token"
) {
  await page.route(`${API_URL}/auth/${provider}`, async (route) => {
    await route.fulfill({
      status: 302,
      headers: {
        Location: `${APP_URL}/en/auth/callback?token=${token}`,
      },
    });
  });
}

export async function mockOAuthProviderError(page: Page, provider: string) {
  await page.route(`${API_URL}/auth/${provider}`, async (route) => {
    await route.fulfill({
      status: 302,
      headers: {
        Location: `${APP_URL}/en/auth/callback?error=access_denied&errorDescription=Cancelled`,
      },
    });
  });
}
