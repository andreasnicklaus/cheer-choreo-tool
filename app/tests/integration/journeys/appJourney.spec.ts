import { test } from "@playwright/test";
import AppPage from "../pages/appPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import { mockNotifications, mockVersion } from "../utils/requests";
import { defaultVersion } from "../testData/version";

let appPage: AppPage;

test.beforeEach(async ({ page }) => {
  appPage = new AppPage(page);
  await mockDefaultStartRequests(page);
  await appPage.goToPage();
});

test.describe("App contents for unauthenticated users", () => {
  test("displays footer contents", async () => {
    await appPage.iCheckFooterContents();
  });

  test("displays header contents", async ({}, testInfo) => {
    if (Boolean(testInfo.project.use.isMobile)) await appPage.iOpenMobileMenu();
    await appPage.iCheckHeaderContents();
  });

  test("displays app install window and can be hidden by dismissing", async () => {
    await appPage.iCheckAppInstallWindow();
    await appPage.iDismissAppInstallWindow();
  });

  test("displays app install window and can be hidden by installation", async () => {
    await appPage.iCheckAppInstallWindow();
    await appPage.iInstallApp();
  });

  test("displays correct app version and server version", async ({}, testInfo) => {
    await appPage.iCheckAppVersion();
    await appPage.iCheckServerVersion(
      defaultVersion,
      Boolean(testInfo.project.use.isMobile)
    );
    await appPage.iCheckVersionMismatchErrorMessage(defaultVersion);
    await mockVersion(appPage.page, "");
    await appPage.goToPage();
    await appPage.iCheckServerVersion(
      null,
      Boolean(testInfo.project.use.isMobile)
    );
  });
});

test.describe("App contents for authenticated users", () => {
  test.use({
    storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
  });

  test("displays navigation dropdown and empty notification list", async ({}, testInfo) => {
    await mockNotifications(appPage.page, []);
    await appPage.goToPage();
    if (Boolean(testInfo.project.use.isMobile)) await appPage.iOpenMobileMenu();
    await appPage.iOpenNotificationDropDown();
    await appPage.iShouldSeeEmptyNotificationNotice();
  });

  test("displays navigation dropdown and notification should be marked as read", async ({}, testInfo) => {
    if (Boolean(testInfo.project.use.isMobile)) await appPage.iOpenMobileMenu();

    await appPage.iOpenNotificationDropDown();
    await appPage.iCheckNotificationDropDownContents();
    await appPage.iMarkFirstNotificationItemAsRead();
  });

  test("displays account dropdown contents", async ({}, testInfo) => {
    const isMobile = Boolean(testInfo.project.use.isMobile);
    if (isMobile) await appPage.iOpenMobileMenu();

    await appPage.iOpenAccountDropDown();
    await appPage.iCheckAccountDropDownContents();
    await appPage.iCheckActiveClub(isMobile);
  });

  test.describe("displays menu items for authenticated users", async () => {
    test("Overview menu item", async ({}, testInfo) => {
      if (Boolean(testInfo.project.use.isMobile))
        await appPage.iOpenMobileMenu();
      await appPage.iCheckOverviewMenuItem();
    });
    test("Choreos menu item", async ({}, testInfo) => {
      if (Boolean(testInfo.project.use.isMobile))
        await appPage.iOpenMobileMenu();

      await appPage.iCheckChoreosMenuItem();
    });
    test("Teams menu item", async ({}, testInfo) => {
      if (Boolean(testInfo.project.use.isMobile))
        await appPage.iOpenMobileMenu();

      await appPage.iCheckTeamsMenuItem();
    });
  });
});

test.describe("App localization", () => {
  test("can switch language to German", async ({}, testInfo) => {
    if (Boolean(testInfo.project.use.isMobile)) await appPage.iOpenMobileMenu();
    await appPage.iSwitchLanguageTo("Deutsch");
  });

  test("automatically switches language based on localized path", async () => {
    await appPage.page.goto("/de");
    await appPage.iCheckGermanLocalization();
  });
});

test.describe("App localization with user locale set", () => {
  test.use({
    locale: "de-DE",
  });
  test("automatically switches language based on browser settings", async () => {
    await appPage.goToPage();
    await appPage.iCheckGermanLocalization();
  });
});

test.describe("App localization with localStorage set", () => {
  test.use({
    storageState: "tests/integration/testData/.localstorage-dev.german.json",
  });
  test("automatically switches language based on localStorage", async () => {
    await appPage.goToPage();
    await appPage.iCheckGermanLocalization();
  });
});
