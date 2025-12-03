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
      name: "E-mail address",
    });
    await this.iFillInput(emailInput, email);
  }

  async iInputPassword(password: string) {
    const passwordInput = this.page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    await this.iFillInput(passwordInput, password);
  }

  async iInputPasswordRepetition(password: string) {
    const passwordInput = this.page.getByRole("textbox", {
      name: "Repeat password",
    });
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
}
