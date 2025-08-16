import { expect, Page } from "@playwright/test";
import TestPage from "./page";
import { defaultUser } from "../testData/user";
import { defaultClubs } from "../testData/club";

export default class AccountPage extends TestPage {
  route = "/account";

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      "Account - Choreo Planner | The best free online tool for choreo sport"
    );
  }

  iCheckUserInfoDisplay() {
    return Promise.all([
      expect(
        this.page.getByRole("heading", { name: defaultUser.username })
      ).toBeVisible(),
      expect(this.page.getByText(defaultUser.email)).toBeVisible(),
      expect(this.page.getByText("confirmed")).toBeVisible({
        visible: defaultUser.emailConfirmed,
      }),
      expect(
        this.page
          .locator("div")
          .filter({ hasText: `${defaultUser.username} ${defaultUser.email}` })
          .nth(1)
          .getByText("just now")
      ).toHaveCount(2),
    ]);
  }

  iSwitchToClubs() {
    return this.page.getByRole("tab", { name: "Clubs" }).click();
  }
  iSwitchToSettings() {
    return this.page.getByRole("tab", { name: "Settings" }).click();
  }
  iSwitchToDangerZone() {
    return this.page.getByRole("tab", { name: "Danger Zone" }).click();
  }

  iCheckClubInfoDisplay() {
    return Promise.all([
      defaultClubs.map((club, i) => {
        return expect(
          this.page.getByRole("tab", {
            name: `${club.name}${i == 0 ? " check circle fill" : ""}`,
          })
        ).toBeVisible();
      }),
      expect(
        this.page
          .getByLabel(`${defaultClubs[0].name} Active club`)
          .getByText("just now")
      ).toHaveCount(2),
      expect(
        this.page
          .getByLabel(`${defaultClubs[0].name} Active club`)
          .getByText("You selected this club as the active club")
      ).toBeVisible(),
    ]);
  }

  async iCheckSettingsTabDisplay() {
    await this.iSwitchToSettings();
    return expect(
      this.page.getByRole("checkbox", { name: "I don't want my data to be" })
    ).toBeVisible();
  }

  async iCheckDangerZoneTabDisplay() {
    await this.iSwitchToDangerZone();
    return Promise.all([
      expect(
        this.page.getByRole("button", { name: "key Change Password" })
      ).toBeVisible(),
      expect(
        this.page.getByRole("button", { name: "trash Delete account" })
      ).toBeVisible(),
    ]);
  }

  async iChangeUserInfo(newUsername: string, newEmail: string) {
    const usernameInput = this.page.getByRole("textbox", { name: "Username" });
    await usernameInput.fill(newUsername);
    await expect(usernameInput).toHaveValue(newUsername);

    const emailInput = this.page.getByRole("textbox", {
      name: "E-mail address",
    });
    await emailInput.fill(newEmail);
    await expect(emailInput).toHaveValue(newEmail);

    await this.page.getByRole("button", { name: "Save" }).click();
    return expect(
      this.page.getByText("Your user information was saved")
    ).toBeVisible();
  }

  async iChangeClubInfo(newClubName: string) {
    await this.iSwitchToClubs();

    const nameInput = this.page.getByRole("textbox", { name: "Name" });
    await nameInput.fill(newClubName);
    await expect(nameInput).toHaveValue(newClubName);

    await this.page.getByRole("button", { name: "Save" }).click();
    await expect(
      this.page.getByText("Your club information was saved")
    ).toBeVisible();
  }

  async iChangeActiveClub(clubName: string) {
    await this.iSwitchToClubs();
    await this.page.getByRole("tab", { name: clubName }).click();
    await this.page
      .getByRole("button", { name: "check Select as active club" })
      .click();
    return expect(
      this.page.getByRole("tab", { name: `${clubName} check circle` })
    ).toBeVisible();
  }

  async iChangeSettings() {
    await this.iSwitchToSettings();
    await this.page
      .getByRole("group", { name: "Tracking (Opt-out):" })
      .locator("div")
      .nth(2)
      .click();
    await this.page.getByRole("button", { name: "Save" }).click();
    await expect(
      this.page.getByText("Your settings were saved!")
    ).toBeVisible();
  }

  async iChangePassword(newPassword: string) {
    await this.iSwitchToDangerZone();
    await this.page.getByRole("button", { name: "Change Password" }).click();
    await this.page
      .getByRole("group", { name: "New password:" })
      .getByPlaceholder("New password")
      .fill(newPassword);
    await this.page
      .getByRole("group", { name: "Repetition:" })
      .getByPlaceholder("New password")
      .fill(newPassword);
    await this.page
      .getByRole("button", { name: "Change password", exact: true })
      .click();
    await expect(
      this.page.getByText("Your password has been changed")
    ).toBeVisible();
  }

  async iDeleteAccount() {
    await this.iSwitchToDangerZone();
    await this.page.getByRole("button", { name: "Delete Account" }).click();
    const checkbox = this.page.getByText("I understand and want to");
    await expect(checkbox).toBeVisible();
    await checkbox.click();
    await this.page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete account" })
      .click();
    await this.page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete now" })
      .click();
    await expect(this.page).toHaveURL("/en/login");
  }
}
