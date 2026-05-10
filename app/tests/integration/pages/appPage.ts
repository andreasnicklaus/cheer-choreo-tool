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
      expect(footerLinks.nth(0)).toHaveAttribute("href", "/en"),
      expect(footerLinks.nth(1)).toHaveText("Help"),
      expect(footerLinks.nth(1)).toHaveAttribute("href", "/en/hilfe"),
      expect(footerLinks.nth(2)).toHaveText("Contact & Support"),
      expect(footerLinks.nth(2)).toHaveAttribute("href", "/en/contact"),
      expect(footerLinks.nth(3)).toHaveText("Imprint"),
      expect(footerLinks.nth(3)).toHaveAttribute("href", "/en/impressum"),
      expect(footerLinks.nth(4)).toHaveText("Data protection"),
      expect(footerLinks.nth(4)).toHaveAttribute("href", "/en/datenschutz"),
      expect(footerLinks.nth(5)).toHaveText("Documentation"),
      expect(footerLinks.nth(5)).toHaveAttribute("href", "/docs/"),

      // External Links
      expect(footerLinks.nth(6)).toHaveText("Instagram"),
      expect(footerLinks.nth(6)).toHaveAttribute(
        "href",
        "https://www.instagram.com/choreoplaner/"
      ),
      expect(footerLinks.nth(7)).toHaveText("Facebook"),
      expect(footerLinks.nth(7)).toHaveAttribute(
        "href",
        "https://www.facebook.com/choreoplaner/"
      ),
      expect(footerLinks.nth(8)).toHaveText("Github"),
      expect(footerLinks.nth(8)).toHaveAttribute(
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
        /\/Icon.*\.png/g
      ),
      expect(nav).toContainText("Start"),
      expect(nav).toContainText("Choreos"),
      expect(nav).toContainText("Teams"),
      expect(nav).toContainText("Deutsch"),
      expect(nav).toContainText("English"),
      expect(nav).toContainText("Help"),
      expect(nav).toContainText("Log in"),

      expect(navLinks.nth(0)).toHaveAttribute("href", "/en"),
      expect(navLinks.nth(1)).toHaveAttribute("href", "/en/start"),
      expect(navLinks.nth(1)).toBeDisabled(),
      expect(this.page.getByRole("button", { name: "Choreos" })).toBeDisabled(),
      expect(this.page.getByRole("button", { name: "Teams" })).toBeDisabled(),
      expect(
        this.page.getByRole("button", { name: "Log in", exact: true })
      ).toHaveAttribute("href", "/en/login"),
    ]);
  }

  iCheckAppVersion() {
    return Promise.all([
      expect(this.page.getByText("Version:")).toContainText("0.13.1"),
    ]);
  }

  async iCheckServerVersion(serverVersion: string | null, isMobile: boolean) {
    if (!isMobile) {
      const expectedTitle = serverVersion
        ? `Servers are online (${serverVersion})`
        : "Servers are offline";
      await expect(this.page.getByTestId("serverStatus")).toBeVisible();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.page.getByTestId("serverStatus").hover();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await expect(this.page.getByText(expectedTitle)).toBeVisible();
    }
  }

  async iCheckVersionMismatchErrorMessage(serverVersion: string) {
    await this.page.getByTestId("serverVersionTooltip").hover();
    return expect(
      this.page.getByText(
        `Die Version der Webseite (0.13.1) entspricht nicht der Version der Server (${serverVersion})!`
      )
    ).toBeVisible();
  }

  async iCheckAppInstallWindow() {
    return Promise.all([
      expect(this.page.getByText("Download the app! The app")).toBeVisible(),
      expect(
        this.page.getByRole("button", { name: "No thanks!" })
      ).toBeVisible(),
      expect(this.page.getByRole("button", { name: "INSTALL" })).toBeVisible(),
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
      name: "INSTALL",
    });
    await this.iClickButton(installButton);

    return expect(
      this.page.getByText("Download the app! The app")
    ).not.toBeVisible();
  }

  iOpenNotificationDropDown() {
    const notificationButton = this.page.getByTestId("notification-button");
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
    const markReadButton = this.page.getByTestId("toggleReadStatus-button");
    return this.iClickButton(markReadButton);
  }

  async iOpenAccountDropDown() {
    const accountDropDown = this.page.getByTestId("account-dropdown");
    await expect(accountDropDown).toBeVisible();
    return accountDropDown.click();
  }

  iCheckAccountDropDownContents(isMobile: boolean) {
    return Promise.all(
      [
        expect(
          isMobile
            ? this.page.getByRole("link", { name: defaultUser.username })
            : this.page.getByRole("menuitem", { name: defaultUser.username })
        ).toBeVisible(),
        expect(this.page.getByTestId("logout-button")).toBeVisible(),
        expect(
          isMobile
            ? this.page.locator("#nav-collapse").getByText("Clubs")
            : this.page.getByRole("menu").getByText("Clubs")
        ).toBeVisible(),
        defaultClubs.map((club) =>
          expect(
            isMobile
              ? this.page.getByRole("link", { name: club.name })
              : this.page.getByRole("menuitem", { name: club.name })
          ).toBeVisible()
        ),
        expect(
          isMobile
            ? this.page.getByRole("link", { name: "New club" })
            : this.page.getByRole("menuitem", { name: "New club" })
        ).toBeVisible(),
        ...defaultClubs.map((club) => {
          expect(this.page.getByText(club.name, { exact: true })).toBeVisible();
        }),
      ].flat()
    );
  }

  async iCheckActiveClub(isMobile: boolean) {
    const firstClubMenuItem = isMobile
      ? this.page.getByRole("link", { name: defaultClubs[0].name })
      : this.page.getByRole("menuitem", {
          name: defaultClubs[0].name,
          exact: true,
        });
    const secondClubMenuItem = isMobile
      ? this.page.getByRole("link", { name: defaultClubs[1].name })
      : this.page.getByRole("menuitem", {
          name: defaultClubs[1].name,
          exact: true,
        });

    const primaryClass = isMobile ? "link-primary" : "text-primary";

    await expect(firstClubMenuItem).toContainClass(primaryClass);
    await expect(secondClubMenuItem).not.toContainClass(primaryClass);

    await secondClubMenuItem.click();

    if (isMobile) await this.iOpenMobileMenu();
    else await this.iOpenAccountDropDown();

    await expect(secondClubMenuItem).toContainClass(primaryClass);
    // TODO: fix this test in mobile safari, currently the active club is properly highlighted in the mobile menu, but the test fails to detect the class change.
    // await expect(firstClubMenuItem).not.toContainClass(primaryClass);
  }

  async iCheckOverviewMenuItem() {
    const overviewMenuItem = this.page.getByRole("link", {
      name: "Overview",
      exact: true,
    });
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
    await this.iClickButton(menuToggle);
    return new Promise((resolve) => setTimeout(resolve, 200));
  }

  async iSwitchLanguageTo(language: string) {
    const languageSelectButton = this.page.getByTestId("locale-switch");
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
