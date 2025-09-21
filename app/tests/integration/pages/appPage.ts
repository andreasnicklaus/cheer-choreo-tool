import { expect, type Page } from "@playwright/test";
import TestPage from "./page";
import { defaultNotifications } from "../testData/notification";
import { defaultUser } from "../testData/user";
import { defaultSeasons } from "../testData/season";
import { defaultChoreos } from "../testData/choreo";
import { defaultTeams } from "../testData/team";
import { defaultClubs } from "../testData/club";

export default class AppPage extends TestPage {
  route = "/";

  constructor(page: Page) {
    super(page);
  }

  iCheckFooterContents() {
    const footerLinks = this.page.locator("footer a");
    return Promise.all([
      expect(
        this.page.getByRole("heading", { name: "Internal Links" })
      ).toBeVisible(),
      expect(
        this.page.getByRole("heading", { name: "External Links" })
      ).toBeVisible(),
      expect(this.page.locator("footer")).toContainText(
        `Andreas Nicklaus @${new Date().getFullYear()}`
      ),

      // Internal Links
      expect(footerLinks.nth(0)).toHaveText("Start"),
      expect(footerLinks.nth(0)).toHaveAttribute("href", "/en/"),
      expect(footerLinks.nth(1)).toHaveText("Help"),
      expect(footerLinks.nth(1)).toHaveAttribute("href", "/en/hilfe"),
      expect(footerLinks.nth(2)).toHaveText("Imprint"),
      expect(footerLinks.nth(2)).toHaveAttribute("href", "/en/impressum"),
      expect(footerLinks.nth(3)).toHaveText("Data protection"),
      expect(footerLinks.nth(3)).toHaveAttribute("href", "/en/datenschutz"),
      expect(footerLinks.nth(4)).toHaveText("Documentation"),
      expect(footerLinks.nth(4)).toHaveAttribute("href", "/docs/"),

      // External Links
      expect(footerLinks.nth(5)).toHaveText("Instagram"),
      expect(footerLinks.nth(5)).toHaveAttribute(
        "href",
        "https://www.instagram.com/choreoplaner/"
      ),
      expect(footerLinks.nth(6)).toHaveText("Facebook"),
      expect(footerLinks.nth(6)).toHaveAttribute(
        "href",
        "https://www.facebook.com/choreoplaner/"
      ),
      expect(footerLinks.nth(7)).toHaveText("Github"),
      expect(footerLinks.nth(7)).toHaveAttribute(
        "href",
        "https://github.com/andreasnicklaus/cheer-choreo-tool"
      ),
    ]);
  }

  iCheckHeaderContents() {
    const nav = this.page.locator("nav");
    const navLinks = this.page.locator("a.nav-link");
    return Promise.all([
      expect(nav).toBeVisible(),
      expect(this.page.locator(".navbar-brand > img")).toBeVisible(),
      expect(this.page.locator(".navbar-brand > img")).toHaveAttribute(
        "src",
        /\/Icon*.png/g
      ),
      expect(nav).toContainText("Start"),
      expect(nav).toContainText("Choreos"),
      expect(nav).toContainText("Teams"),
      expect(nav).toContainText("Deutsch"),
      expect(nav).toContainText("English"),
      expect(nav).toContainText("Help"),
      expect(nav).toContainText("Log in"),

      expect(navLinks.nth(0)).toHaveAttribute("href", "/en/"),
      expect(navLinks.nth(1)).toHaveAttribute("href", "#"),
      expect(navLinks.nth(1)).toHaveAttribute("aria-disabled", "true"),
      expect(navLinks.nth(2)).toHaveAttribute("aria-disabled", "true"),
      expect(navLinks.nth(3)).toHaveAttribute("aria-disabled", "true"),
      expect(
        this.page.getByRole("link", {
          name: "Log in",
          exact: true,
          includeHidden: true,
        })
      ).toHaveAttribute("href", "/en/login"),
    ]);
  }

  iCheckAppVersion() {
    return Promise.all([
      expect(this.page.getByText("Version:")).toContainText("0.11.0"),
    ]);
  }

  async iCheckServerVersion(serverVersion: string | null, isMobile: boolean) {
    const expectedTitle = serverVersion
      ? `Servers are online (${serverVersion})`
      : "Servers are offline";
    if (!isMobile)
      await expect(this.page.getByTestId("serverStatus")).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await expect(this.page.getByTestId("serverStatus")).toHaveAttribute(
      "title",
      expectedTitle
    );
  }

  iCheckVersionMismatchErrorMessage(serverVersion: string) {
    return expect(
      this.page.getByTitle(
        `Die Version der Webseite (0.11.0) entspricht nicht der Version der Server (${serverVersion})!`
      )
    ).toBeVisible();
  }

  async iCheckAppInstallWindow() {
    return Promise.all([
      expect(this.page.getByText("Download the app! The app")).toBeVisible(),
      expect(
        this.page.getByRole("button", { name: "No thanks!" })
      ).toBeVisible(),
      expect(
        this.page.getByRole("button", { name: "download INSTALL" })
      ).toBeVisible(),
    ]);
  }

  async iDismissAppInstallWindow() {
    const dismissButton = this.page.getByRole("button", { name: "No thanks!" });
    await this.iClickButton(dismissButton);

    return expect(
      this.page.getByText("Download the app! The app")
    ).not.toBeVisible();
  }

  async iInstallApp() {
    const installButton = this.page.getByRole("button", {
      name: "download INSTALL",
    });
    await this.iClickButton(installButton);

    return expect(
      this.page.getByText("Download the app! The app")
    ).not.toBeVisible();
  }

  iOpenNotificationDropDown() {
    const notificationButton = this.page.getByRole("button", { name: "bell" });
    return this.iClickButton(notificationButton);
  }

  iShouldSeeEmptyNotificationNotice() {
    return expect(
      this.page.getByText("You have not received any notifications yet.")
    ).toBeVisible();
  }

  iCheckNotificationDropDownContents() {
    return Promise.all(
      defaultNotifications.map((notification) => {
        return Promise.all([
          expect(
            this.page.getByText(notification.title, { exact: true })
          ).toBeVisible(),
          expect(
            this.page.getByText(notification.message, { exact: true })
          ).toBeVisible(),
        ]);
      })
    );
  }

  iMarkFirstNotificationItemAsRead() {
    const markReadButton = this.page
      .getByRole("button", { name: "envelope open" })
      .nth(0);
    return this.iClickButton(markReadButton);
  }

  async iOpenAccountDropDown() {
    const accountDropDown = this.page.locator('[id="__BVID__44__BV_toggle_"]');
    await expect(accountDropDown).toBeVisible();
    return accountDropDown.click();
  }

  iCheckAccountDropDownContents() {
    return Promise.all(
      [
        expect(
          this.page.getByRole("menuitem", { name: defaultUser.username })
        ).toBeVisible(),
        expect(
          this.page.getByRole("menuitem", { name: "door open Log out" })
        ).toBeVisible(),
        expect(
          this.page
            .getByLabel(defaultUser.username, {
              exact: true,
            })
            .or(this.page.getByLabel("", { exact: true }))
            .getByText("Clubs")
        ).toBeVisible(),
        defaultClubs.map((club) =>
          expect(
            this.page.getByRole("menuitem", { name: club.name, exact: true })
          ).toBeVisible()
        ),
        expect(
          this.page.getByRole("menuitem", { name: "plus New club" })
        ).toBeVisible(),
        ...defaultClubs.map((club) => {
          expect(this.page.getByText(club.name, { exact: true })).toBeVisible();
        }),
      ].flat()
    );
  }

  async iCheckActiveClub(isMobile: boolean) {
    const firstClubMenuItem = this.page.getByRole("menuitem", {
      name: defaultClubs[0].name,
      exact: true,
    });
    const secondClubMenuItem = this.page.getByRole("menuitem", {
      name: defaultClubs[1].name,
      exact: true,
    });

    await expect(firstClubMenuItem).toContainClass("text-primary");
    await expect(secondClubMenuItem).not.toContainClass("text-primary");

    await secondClubMenuItem.click();
    if (isMobile) await this.iOpenMobileMenu();
    await this.iOpenAccountDropDown();

    await expect(secondClubMenuItem).toContainClass("text-primary");
    await expect(firstClubMenuItem).not.toContainClass("text-primary");
  }

  async iCheckOverviewMenuItem() {
    const overviewMenuItem = this.page.getByRole("link", { name: "Overview" });
    await expect(overviewMenuItem).toBeVisible();
    await overviewMenuItem.click();
    return expect(this.page).toHaveURL("/en/start");
  }
  async iCheckChoreosMenuItem() {
    const choreosMenuItem = this.page.getByRole("button", { name: "Choreos" });
    await expect(choreosMenuItem).toBeVisible();
    await choreosMenuItem.click();
    const seasonDropDown = this.page.getByText(defaultSeasons[0].name);
    await expect(seasonDropDown).toBeVisible();
    await seasonDropDown.click();
    const choreoMenuItem = this.page.getByRole("menuitem", {
      name: defaultChoreos[0].name,
    });
    await expect(choreoMenuItem).toBeVisible();
    await choreoMenuItem.click();
    return expect(this.page).toHaveURL(`/en/choreo/${defaultChoreos[0].id}`);
  }
  async iCheckTeamsMenuItem() {
    const teamMenuItem = this.page.getByRole("button", { name: "Teams" });
    await this.iClickButton(teamMenuItem);

    const teamLink = this.page.getByRole("menuitem", {
      name: defaultTeams[0].name,
      exact: true,
    });
    await expect(teamLink).toBeVisible();
    await teamLink.click();
    return expect(this.page).toHaveURL(`/en/team/${defaultTeams[0].id}`);
  }

  async iOpenMobileMenu() {
    const menuToggle = this.page.getByRole("button", {
      name: "Toggle navigation",
    });
    return this.iClickButton(menuToggle);
  }

  async iSwitchLanguageTo(language: string) {
    const languageSelectButton = this.page.locator(
      '[id="__BVID__26__BV_toggle_"]'
    );
    await this.iClickButton(languageSelectButton);

    const languageButton = this.page.getByRole("menuitem", { name: language });
    await this.iClickButton(languageButton);

    await this.iCheckGermanLocalization();
  }

  async iCheckGermanLocalization() {
    await expect(
      this.page.getByRole("heading", { name: "Dein Choreo Planer" })
    ).toBeVisible();
    await expect(this.page).toHaveTitle(
      "Choreo Planer | Das kostenlose Online-Tool für Choreo-Sport"
    );
  }
}
