import { expect, test } from "@playwright/test";
import StartPage from "../pages/startPage";

let startPage: StartPage;

test.beforeEach(async ({ page }) => {
  startPage = new StartPage(page);
  await startPage.goToPage();
});

test("has title", async () => {
  await startPage.iCheckTitle();
});

test("displays all sections", async () => {
  await startPage.iCheckAllSections();
});

test("sections contain correct contents", async ({}, testInfo) => {
  await startPage.iCheckMainSectionContents();
  await startPage.iCheckMatSectionContents();
  await startPage.iCheckFeatureCallouts(Boolean(testInfo.project.use.isMobile));
  await startPage.iCheckCountsheetSectionContents(
    Boolean(testInfo.project.use.isMobile)
  );
  await startPage.iCheckCreateVideoSectionContents();
});
