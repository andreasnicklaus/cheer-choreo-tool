import test from "@playwright/test";
import AccountPage from "../pages/accountPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import { defaultClubs } from "../testData/club";

let accountPage: AccountPage;

test.beforeEach(async ({ page }) => {
  accountPage = new AccountPage(page);
  await mockDefaultStartRequests(page);
  await accountPage.goToPage();
});

test.use({
  storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
});

test("should display the account page with the correct title", async () => {
  await accountPage.iCheckTitle();
});

test.describe("User Information", () => {
  test("should display user information", async () => {
    await accountPage.iCheckUserInfoDisplay();
  });

  test("should allow changing the user information", async () => {
    await accountPage.iChangeUserInfo(
      "NewUsername",
      "new.email@choreo-planer.de"
    );
  });
});

test.describe("Clubs", () => {
  test("should display clubs info", async () => {
    await accountPage.iSwitchToClubs();
    await accountPage.iCheckClubInfoDisplay();
  });
  test("should allow changing the club information", async () => {
    await accountPage.iChangeClubInfo("New Club Name");
  });

  test("should allow changing the active club", async () => {
    await accountPage.iChangeActiveClub(defaultClubs[1].name);
  });
});

test.describe("Settings", () => {
  test("should allow changing the settings", async () => {
    await accountPage.iChangeSettings();
  });
  test("should display settings tab", async () => {
    await accountPage.iCheckSettingsTabDisplay();
  });
});

test.describe("Danger Zone", () => {
  test("should display danger zone tab", async () => {
    await accountPage.iCheckDangerZoneTabDisplay();
  });
  test("should allow changing the password in the danger zone", async () => {
    await accountPage.iChangePassword("newpassword");
  });

  test("should allow deleting the account in the danger zone", async () => {
    await accountPage.iDeleteAccount();
  });
});
