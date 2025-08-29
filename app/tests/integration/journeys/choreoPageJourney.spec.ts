import test from "@playwright/test";
import ChoreoPage from "../pages/choreoPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import { mockChoreos, mockClubs } from "../utils/requests";
import { defaultClubs } from "../testData/club";
import { defaultChoreos, emptyChoreos } from "../testData/choreo";

let choreoPage: ChoreoPage;

test.beforeEach(async ({ page }) => {
  choreoPage = new ChoreoPage(page);
  await mockDefaultStartRequests(page);
  await choreoPage.goToPage();
});

test.use({
  storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
});

test("should display the page with the correct title", async ({}, testInfo) => {
  await choreoPage.iCheckTitle(Boolean(testInfo.project.use.isMobile));
});

test("should display the page with the instant help", async ({}, testInfo) => {
  await mockDefaultStartRequests(choreoPage.page);
  await mockClubs(
    choreoPage.page,
    defaultClubs.map((club) => ({
      ...club,
      Teams: club.Teams.map((team) => ({
        ...team,
        Choreos: emptyChoreos,
      })),
    }))
  );
  await mockChoreos(choreoPage.page, emptyChoreos);
  await choreoPage.goToPage();
  await choreoPage.iShouldSeeHelpDisplay(
    Boolean(testInfo.project.use.isMobile)
  );
});

test("should display the help on button press", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile)) {
    await choreoPage.iClickHelpButton();
    await choreoPage.iShouldSeeHelpDisplay(
      Boolean(testInfo.project.use.isMobile)
    );
  }
});

test("should display the choreo name", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile))
    await choreoPage.iSeeChoreoName(defaultChoreos[0].name);
});

test("should edit the choreo name", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile)) {
    await choreoPage.iEditChoreoName();
  }
});

test("should edit the choreo length", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile))
    await choreoPage.iEditChoreoLength();
});

test("should edit the choreo mat type", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile))
    await choreoPage.iEditChoreoMatType();
});

test("should display lineups on the mat and the overview", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile))
    await choreoPage.iSeeLineupsOnMatAndOverview();
});

test("should display hits on the countsheet and the overview", async ({}, testInfo) => {
  if (!Boolean(testInfo.project.use.isMobile))
    await choreoPage.iSeeHitsOnCountsheetsAndOverview();
});

test("mobile devices should display constrictions", async ({}, testInfo) => {
  if (Boolean(testInfo.project.use.isMobile))
    await choreoPage.iSeeMobileConstructions();
});
