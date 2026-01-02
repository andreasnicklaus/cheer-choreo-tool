import test from "@playwright/test";
import HelpPage from "../pages/helpPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";

let helpPage: HelpPage;

test.beforeEach(async ({ page }) => {
  helpPage = new HelpPage(page);
  await mockDefaultStartRequests(page);
  await helpPage.goToPage();
});

test("has title", async () => {
  await helpPage.iCheckTitle();
});

test("displays questions and answers", async () => {
  await helpPage.iCheckQuestionsAndAnswers();
});

test("filters questions by search term", async () => {
  await helpPage.iTypeInSearchInput();
});
