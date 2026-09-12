import test from "@playwright/test";
import AuthCallbackPage from "../pages/authCallbackPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";

let callbackPage: AuthCallbackPage;

test.beforeEach(async ({ page }) => {
  callbackPage = new AuthCallbackPage(page);
  await mockDefaultStartRequests(page);
});

test.describe("Auth callback page", () => {
  test("should save token and redirect to start on successful callback", async () => {
    await callbackPage.page.goto("/auth/callback?token=test-jwt-token");
    await callbackPage.iAmRedirectedToStart();
    await callbackPage.iTokenIsStored();
  });

  test("should show error and redirect to login on failed callback", async () => {
    await callbackPage.page.goto(
      "/auth/callback?error=authentication_error&errorDescription=Cancelled"
    );
    await callbackPage.iAmRedirectedToLogin();
    await callbackPage.iSeeErrorMessage();
  });

  test("should redirect to login when neither token nor error is present", async () => {
    await callbackPage.page.goto("/auth/callback");
    await callbackPage.iAmRedirectedToLogin();
  });
});
