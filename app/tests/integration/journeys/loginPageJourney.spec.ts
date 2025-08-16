import test, { expect } from "@playwright/test";
import LoginPage from "../pages/loginPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import {
  mockLoginRequest,
  mockRegistrationRequest,
  mockSsoLoginRequest,
} from "../utils/requests";
import { defaultChoreos } from "../testData/choreo";

let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  await mockDefaultStartRequests(page);
  await loginPage.goToPage();
});

test.describe("Not yet logged in", () => {
  test("should display the login page with the correct title", async () => {
    await loginPage.iCheckTitle();
  });

  test("should register a new user", async () => {
    await mockRegistrationRequest(loginPage.page);
    await loginPage.iSwitchToRegistration();
    await loginPage.iInputUserName("newUserName");
    await loginPage.iInputEmail("newUserName@gmail.com");
    await loginPage.iInputPassword("newPassword");
    await loginPage.iInputPasswordRepetition("newPassword");
    await loginPage.iClickOnRegisterButton();
    await loginPage.iCheckRedirectionToPage();
  });
  test("should display an error message on registration", async () => {
    await mockRegistrationRequest(loginPage.page);
    await loginPage.iSwitchToRegistration();
    await loginPage.iInputUserName("newUserName");
    await loginPage.iInputEmail("newUserName@gmail.com");
    await loginPage.iInputPassword("falsePassword");
    await loginPage.iInputPasswordRepetition("falsePassword");
    await loginPage.iClickOnRegisterButton();
    await loginPage.iCheckErrorAlert(
      "It seems that there is already a user with this name or email address"
    );
  });
  test("should redirect to redirectUrl after registration", async () => {
    await mockDefaultStartRequests(loginPage.page);
    await mockRegistrationRequest(loginPage.page);
    const redirectUrl = `/en/choreo/${defaultChoreos[0].id}`;
    await loginPage.page.goto(
      `/login?redirectUrl=${encodeURIComponent(redirectUrl)}`
    );
    await loginPage.iSwitchToRegistration();
    await loginPage.iInputUserName("newUserName");
    await loginPage.iInputEmail("newUserName@gmail.com");
    await loginPage.iInputPassword("newPassword");
    await loginPage.iInputPasswordRepetition("newPassword");
    await loginPage.iClickOnRegisterButton();
    await loginPage.iCheckRedirectionToPage(redirectUrl);
  });
  test("should log in", async () => {
    await mockLoginRequest(loginPage.page);
    await loginPage.iInputUserName("newUserName");
    await loginPage.iInputPassword("newPassword");
    await loginPage.iClickOnLoginButton();
    await loginPage.iCheckRedirectionToPage();
  });
  test("should display an error message on login", async () => {
    await mockLoginRequest(loginPage.page);
    await loginPage.iInputUserName("newUserName");
    await loginPage.iInputPassword("falsePassword");
    await loginPage.iClickOnLoginButton();
    await loginPage.iCheckErrorAlert();
  });
  test("should redirect to redirectUrl after login", async () => {
    await mockDefaultStartRequests(loginPage.page);
    await mockLoginRequest(loginPage.page);
    const redirectUrl = `/en/choreo/${defaultChoreos[0].id}`;
    await loginPage.page.goto(
      `/login?redirectUrl=${encodeURIComponent(redirectUrl)}`
    );
    await loginPage.iInputUserName("newUserName");
    await loginPage.iInputPassword("newPassword");
    await loginPage.iClickOnLoginButton();
    await loginPage.iCheckRedirectionToPage(redirectUrl);
  });
});
test.describe("Already logged in", () => {
  test.use({
    storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
  });
  // TODO: test automatic redirection if the user is already logged in
});

test.describe("SSO login", () => {
  test("should redirect to the start page on SSO", async () => {
    await mockSsoLoginRequest(loginPage.page);
    await loginPage.page.goto(
      "/login?sso=5514a6f3-f327-498c-a352-96afef974ebe"
    );
    await loginPage.iCheckRedirectionToPage();
  });
  test("should redirect to the a page described by redirectUrl on SSO", async () => {
    await mockDefaultStartRequests(loginPage.page);
    await mockSsoLoginRequest(loginPage.page);
    const redirectUrl = `/en/choreo/${defaultChoreos[0].id}`;
    await loginPage.page.goto(
      `/login?sso=5514a6f3-f327-498c-a352-96afef974ebe&redirectUrl=${encodeURIComponent(
        redirectUrl
      )}`
    );
    await loginPage.iCheckRedirectionToPage(redirectUrl);
  });
});
