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
}
