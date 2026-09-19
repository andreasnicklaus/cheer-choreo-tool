import { expect, Page } from "@playwright/test";
import TestPage from "./page";

export default class AuthCallbackPage extends TestPage {
  route = "/auth/callback";

  constructor(page: Page) {
    super(page);
  }

  iSeeRedirectingText() {
    return expect(this.page.getByText("Redirecting...")).toBeVisible();
  }

  async iAmRedirectedToStart() {
    await expect(this.page).toHaveURL("/en/start");
  }

  async iAmRedirectedToLogin() {
    await expect(this.page).toHaveURL("/en/login");
  }

  async iTokenIsStored() {
    const token = await this.page.evaluate(() =>
      localStorage.getItem("choreo-planer-token")
    );
    expect(token).toBe("test-jwt-token");
  }

  async iSeeErrorMessage() {
    await expect(this.page.getByText("Social login failed")).toBeVisible();
  }

  async iQueryParamsAreCleaned() {
    await expect(this.page).not.toHaveURL(/token|error|errorDescription/);
  }
}
