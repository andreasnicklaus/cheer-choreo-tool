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

test.describe("non-specific to choreo", () => {
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

  test("mobile devices should display constrictions", async ({}, testInfo) => {
    if (Boolean(testInfo.project.use.isMobile))
      await choreoPage.iSeeMobileConstructions();
  });

  test("should offer a link to countsheet", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iSeeLinkToCountsheet();
  });
  test("should offer a link to video export", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iSeeLinkToVideoExport();
  });
});

test.describe("general choreo properties", () => {
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
});

test.describe("lineups", () => {
  test("should display lineups on the mat and the overview", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iSeeLineupsOnMatAndOverview();
  });
  test("should drag and drop a lineup position", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iDragAndDropLineupPosition();
  });
  test("the select all button should select all members in a lineup", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iSelectAllMembersInLineup();
  });
  test("the edit button should edit a lineup", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile)) await choreoPage.iEditLineup();
  });
  test("the delete button should remove a lineup", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iDeleteLineup();
  });
  test("the 'Add a lineup' should add a lineup", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile)) await choreoPage.iAddLineup();
  });
});

test.describe("hits", () => {
  test("should display hits on the countsheet and the overview", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iSeeHitsOnCountsheetsAndOverview();
  });

  test("the move up button should move the hit to the previous count", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile)) await choreoPage.iMoveHitUp();
  });
  test("the move down button should move the hit to the next count", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile))
      await choreoPage.iMoveHitDown();
  });
  test("the edit button should edit a hit", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile)) await choreoPage.iEditHit();
  });
  test("the delete button should remove a hit", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile)) await choreoPage.iDeleteHit();
  });
  test("the 'Add an entry' should add a hit", async ({}, testInfo) => {
    if (!Boolean(testInfo.project.use.isMobile)) await choreoPage.iAddHit();
  });
});
