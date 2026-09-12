import { expect, Page } from "@playwright/test";
import TestPage from "./page";

export default class LoginPage extends TestPage {
  route = "/login";

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      "Log in - Choreo Planner | Your access to all functions"
    );
  }

  iCheckRedirectionToPage(path: string = "/en/start") {
    return expect(this.page).toHaveURL(path);
  }

  async iInputUserName(userName: string) {
    const userNameInput = this.page.getByRole("textbox", { name: "Username" });
    await this.iFillInput(userNameInput, userName);
  }

  async iInputEmail(email: string) {
    const emailInput = this.page.getByRole("textbox", {
      name: "Email address",
    });
    await this.iFillInput(emailInput, email);
  }

  async iInputPassword(password: string, tabPanel: "Log in" | "Register") {
    const passwordInput = this.page
      .getByRole("tabpanel", { name: tabPanel })
      .getByPlaceholder("Password", { exact: true });
    await this.iFillInput(passwordInput, password);
  }

  async iInputPasswordRepetition(password: string) {
    const passwordInput = this.page.getByPlaceholder("Repeat password");
    await this.iFillInput(passwordInput, password);
  }

  async iClickOnLoginButton() {
    const loginButton = this.page
      .getByLabel("Log in")
      .getByRole("button", { name: "Log in" });
    return this.iClickButton(loginButton);
  }

  async iClickOnRegisterButton() {
    const registerButton = this.page
      .getByLabel("Register")
      .getByRole("button", { name: "Register" });
    return this.iClickButton(registerButton);
  }

  async iCheckErrorAlert(errorMessage: string = "Invalid credentials") {
    const errorAlert = this.page
      .getByRole("alert")
      .filter({ hasText: errorMessage });
    return expect(errorAlert).toBeVisible();
  }

  async iSwitchToRegistration() {
    const registrationTab = this.page.getByRole("tab", { name: "Register" });
    return this.iClickButton(registrationTab);
  }

  iSeeGoogleButton() {
    return expect(
      this.page.getByRole("button", { name: "Sign in with Google" })
    ).toBeVisible();
  }

  iSeeGitHubButton() {
    return expect(
      this.page.getByRole("button", { name: "Sign in with GitHub" })
    ).toBeVisible();
  }

  iSeeFacebookButton() {
    return expect(
      this.page.getByRole("button", { name: "Sign in with Facebook" })
    ).toBeVisible();
  }

  iDontSeeOAuthButtons() {
    return expect(
      this.page.getByRole("button", { name: "Sign in with Google" })
    ).not.toBeVisible();
  }

  async iClickOnGoogleButton() {
    const button = this.page.getByRole("button", {
      name: "Sign in with Google",
    });
    await this.iClickButton(button);
  }

  async iClickOnGitHubButton() {
    const button = this.page.getByRole("button", {
      name: "Sign in with GitHub",
    });
    await this.iClickButton(button);
  }

  async iClickOnFacebookButton() {
    const button = this.page.getByRole("button", {
      name: "Sign in with Facebook",
    });
    await this.iClickButton(button);
  }

  async iDisableSocialLogin() {
    await this.page.route("https://features.choreo-planer.de/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          toggles: [
            {
              name: "social-login",
              enabled: false,
              variant: {
                name: "disabled",
                enabled: false,
                feature_enabled: true,
                featureEnabled: true,
              },
              impressionData: true,
            },
            {
              name: "google-oauth",
              enabled: false,
              variant: {
                name: "disabled",
                enabled: false,
                feature_enabled: true,
                featureEnabled: true,
              },
              impressionData: true,
            },
            {
              name: "github-oauth",
              enabled: false,
              variant: {
                name: "disabled",
                enabled: false,
                feature_enabled: true,
                featureEnabled: true,
              },
              impressionData: true,
            },
            {
              name: "facebook-oauth",
              enabled: false,
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

  async iSeeSocialLoginError() {
    await expect(this.page.getByText("Social login failed")).toBeVisible();
  }

  async iVerifyLoginToken() {
    const token = await this.page.evaluate(() =>
      localStorage.getItem("choreo-planer-token")
    );
    expect(token).toBe("test-jwt-token");
  }
}
