import test from "@playwright/test";
import ImpressumPage from "../pages/impressumPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";

let impressumPage: ImpressumPage;

test.beforeEach(async ({ page }) => {
  impressumPage = new ImpressumPage(page);
  await mockDefaultStartRequests(page);
  await impressumPage.goToPage();
});

test("should have the correct title", async () => {
  await impressumPage.iCheckTitle();
});

test("should display the first section with the title", async () => {
  await impressumPage.iCheckSectionHeading("Imprint");
  await impressumPage.iCheckSectionContent("Information according to § 5 TMG");
});
