import test from "@playwright/test";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import TeamPage from "../pages/teamPage";

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

test("should display the info of all team members in list view", async () => {
  await teamPage.iCheckMemberDisplay(true);
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
