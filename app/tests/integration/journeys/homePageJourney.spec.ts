import { test } from "@playwright/test";
import HomePage from "../pages/homePage";

let homePage: HomePage;

test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page);
  await homePage.goToPage();
});

test("has title", async () => {
  await homePage.iCheckTitle();
});

test("displays all sections", async () => {
  await homePage.iCheckAllSections();
});

test("sections contain correct contents", async ({}, testInfo) => {
  await homePage.iCheckMainSectionContents();
  await homePage.iCheckMatSectionContents();
  await homePage.iCheckFeatureCallouts(Boolean(testInfo.project.use.isMobile));
  await homePage.iCheckCountsheetSectionContents(
    Boolean(testInfo.project.use.isMobile)
  );
  await homePage.iCheckCreateVideoSectionContents();
});
