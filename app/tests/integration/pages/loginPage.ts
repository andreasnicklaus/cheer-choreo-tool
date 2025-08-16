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
    await expect(userNameInput).toBeVisible();
    return userNameInput.fill(userName);
  }

  async iInputEmail(email: string) {
    const emailInput = this.page.getByRole("textbox", {
      name: "E-mail address",
    });
    await expect(emailInput).toBeVisible();
    return emailInput.fill(email);
  }

  async iInputPassword(password: string) {
    const passwordInput = this.page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);
    return expect(passwordInput).toHaveValue(password);
  }

  async iInputPasswordRepetition(password: string) {
    const passwordInput = this.page.getByRole("textbox", {
      name: "Repeat password",
    });
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);
    return expect(passwordInput).toHaveValue(password);
  }

  async iClickOnLoginButton() {
    const loginButton = this.page
      .getByLabel("Log in")
      .getByRole("button", { name: "Log in" });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    return loginButton.click();
  }

  async iClickOnRegisterButton() {
    const registerButton = this.page
      .getByLabel("Register")
      .getByRole("button", { name: "Register" });
    await expect(registerButton).toBeVisible();
    await expect(registerButton).toBeEnabled();
    return registerButton.click();
  }

  async iCheckErrorAlert(errorMessage: string = "Invalid credentials") {
    const errorAlert = this.page
      .getByRole("alert")
      .filter({ hasText: errorMessage });
    return expect(errorAlert).toBeVisible();
  }

  async iSwitchToRegistration() {
    const registrationTab = this.page.getByRole("tab", { name: "Register" });
    await expect(registrationTab).toBeVisible();
    return registrationTab.click();
  }
}
