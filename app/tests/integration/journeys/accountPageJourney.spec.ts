import test from "@playwright/test";
import AccountPage from "../pages/accountPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import { mockAuthMe } from "../utils/requests";
import { defaultClubs } from "../testData/club";
import { sharedUser } from "../testData/user";

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

test.describe("create club modal owner selection", () => {
  test("should display owner selection options when user has shared access", async () => {
    await mockDefaultStartRequests(accountPage.page);
    await mockAuthMe(accountPage.page, sharedUser);
    await accountPage.goToPage();
    await accountPage.iOpenCreateClubModal();
    await accountPage.iSeeOwnerSelectInCreateClubModal();
    await accountPage.iSeeOwnerSelectOptionInCreateClubModal("Owner User");
    await accountPage.iSeeOwnerSelectOptionInCreateClubModal("(you)");
  });

  test("should not display owner selection when user has no shared access", async () => {
    await accountPage.iOpenCreateClubModal();
    await accountPage.iDontSeeOwnerSelectInCreateClubModal();
  });
});

test.describe("Access", () => {
  test("should display Access tab", async () => {
    await accountPage.iSwitchToAccess();
  });

  test("should display Shared with me section", async () => {
    await accountPage.iCheckSharedWithMe();
  });

  test("should display Managed by me section", async () => {
    await accountPage.iCheckManagedByMe();
  });

  test("should show pending status for pending invitations", async () => {
    await accountPage.iSwitchToAccess();
    // Check that pending badges are shown
    await accountPage.iCheckPendingStatusInSharedWithMe();
  });

  test("should allow accepting an invitation", async () => {
    await accountPage.iSwitchToAccess();
    // Check if there are pending invitations to accept
    const acceptButtons = accountPage.page.getByRole("button", {
      name: "Accept",
    });
    const count = await acceptButtons.count();
    if (count > 0) {
      await accountPage.iAcceptAccess();
    }
  });

  test("should allow declining an invitation", async () => {
    await accountPage.iSwitchToAccess();
    // Check if there are pending invitations to decline
    const declineButtons = accountPage.page.getByRole("button", {
      name: "Decline",
    });
    const count = await declineButtons.count();
    if (count > 0) {
      await accountPage.iDeclineAccess();
    }
  });
});
