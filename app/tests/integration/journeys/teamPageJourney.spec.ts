import test from "@playwright/test";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import { mockAuthMe, mockTeams } from "../utils/requests";
import TeamPage from "../pages/teamPage";
import { sharedTeams } from "../testData/team";
import { sharedUser } from "../testData/user";

let teamPage: TeamPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  await mockDefaultStartRequests(page);
  await teamPage.goToPage();
});

test.use({
  storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
});

test("should display the page with the correct title", async () => {
  await teamPage.iCheckTitle();
});

test("should display the info of all team members in table view", async ({}, testInfo) => {
  await teamPage.iCheckMemberDisplay(
    false,
    Boolean(testInfo.project.use.isMobile)
  );
});

test("should display the info of all team members in list view", async ({}, testInfo) => {
  await teamPage.iCheckMemberDisplay(
    true,
    Boolean(testInfo.project.use.isMobile)
  );
});

test("should add a member to the team", async ({}, testInfo) => {
  await teamPage.iAddMember(Boolean(testInfo.project.use.isMobile));
});
test("should import a member to the team", async () => {
  await teamPage.iImportMember();
});
test("should edit a member from the team", async () => {
  await teamPage.iEditMember();
});
test("should delete a member from the team", async () => {
  await teamPage.iDeleteMember();
});
test("should switch to a different season", async () => {
  await teamPage.iSwitchSeason();
});
test("should switch teams", async () => {
  await teamPage.iSwitchTeam();
});
test("should edit a team's name", async () => {
  await teamPage.iEditTeam();
});
test("should delete a team", async () => {
  await teamPage.iDeleteTeam();
});
test("should delete a season", async () => {
  await teamPage.iDeleteSeason();
});

test.describe("create team modal owner selection", () => {
  test("should display owner selection options when user has shared access", async () => {
    await mockDefaultStartRequests(teamPage.page);
    await mockAuthMe(teamPage.page, sharedUser);
    await teamPage.goToPage();
    await teamPage.iSetClubId();
    await teamPage.iOpenCreateTeamModal();
    await teamPage.iSeeOwnerSelectInCreateTeamModal();
    await teamPage.iSeeOwnerSelectOptionInCreateTeamModal("Owner User");
    await teamPage.iSeeOwnerSelectOptionInCreateTeamModal("(you)");
  });

  test("should not display owner selection when user has no shared access", async () => {
    await teamPage.iSetClubId();
    await teamPage.iOpenCreateTeamModal();
    await teamPage.iDontSeeOwnerSelectInCreateTeamModal();
  });
});

test.describe("create season modal owner selection", () => {
  test("should display owner selection options when user has shared access", async () => {
    await mockDefaultStartRequests(teamPage.page);
    await mockAuthMe(teamPage.page, sharedUser);
    await teamPage.goToPage();
    await teamPage.iOpenCreateSeasonModal();
    await teamPage.iSeeOwnerSelectInCreateSeasonModal();
    await teamPage.iSeeOwnerSelectOptionInCreateSeasonModal("Owner User");
    await teamPage.iSeeOwnerSelectOptionInCreateSeasonModal("(you)");
  });

  test("should not display owner selection when user has no shared access", async () => {
    await teamPage.iOpenCreateSeasonModal();
    await teamPage.iDontSeeOwnerSelectInCreateSeasonModal();
  });
});

test.describe("creator and editor display", () => {
  test("should display 'you' as creator when user is the creator", async () => {
    await teamPage.iSeeCreatorDisplay("you");
  });

  test("should display username as creator when creator is another user", async () => {
    await mockTeams(teamPage.page, sharedTeams);
    await teamPage.goToPage();
    await teamPage.iSeeCreatorDisplay("Other User");
  });

  test("should display 'you' as last editor when user is the updater", async () => {
    await teamPage.iSeeUpdaterDisplay("you");
  });

  test("should display username as last editor when updater is another user", async () => {
    await mockTeams(teamPage.page, sharedTeams);
    await teamPage.goToPage();
    await teamPage.iSeeUpdaterDisplay("Other User");
  });
});

test.describe("owner display", () => {
  test("should not display owner when user is the owner", async () => {
    await teamPage.iDontSeeOwnerDisplay();
  });

  test("should display owner when team is shared with user", async () => {
    await mockTeams(teamPage.page, sharedTeams);
    await teamPage.goToPage();
    await teamPage.iSeeOwnerDisplay("Other User");
  });
});
