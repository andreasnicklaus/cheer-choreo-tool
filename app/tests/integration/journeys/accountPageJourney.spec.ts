import test from "@playwright/test";
import AccountPage from "../pages/accountPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";

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

test("should display user information", async () => {
  await accountPage.iCheckUserInfoDisplay();
});

test("should display clubs info", async () => {
  await accountPage.iSwitchToClubs();
  await accountPage.iCheckClubInfoDisplay();
});

// TODO: Add tests for settings and danger zone tabs

// TODO: Add tests for changing the user information
// TODO: Add tests for changing the club information#
// TODO: Add tests for changing the active club
// TODO: Add tests for changing the settings
// TODO: Add tests for changing the password in the danger zone
// TODO: Add tests for deleting the account in the danger zone
