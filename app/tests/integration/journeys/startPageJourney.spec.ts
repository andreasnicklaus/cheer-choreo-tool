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
