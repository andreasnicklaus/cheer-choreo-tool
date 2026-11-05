// sloplint-disable-file TEST-001 -- Assertions are encapsulated in the Playwright page-object methods invoked by these journeys.`r`nimport test from "@playwright/test";
import DatenschutzPage from "../pages/datenschutzPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";

let datenschutzPage: DatenschutzPage;

test.beforeEach(async ({ page }) => {
  datenschutzPage = new DatenschutzPage(page);
  await mockDefaultStartRequests(page);
  await datenschutzPage.goToPage();
});

test("should have the correct title", async () => {
  await datenschutzPage.iCheckTitle();
});

test("should display the first section with the title", async () => {
  await datenschutzPage.iCheckSectionHeading("General Information");
  await datenschutzPage.iCheckSectionContent(
    "The protection of your personal data"
  );
});
