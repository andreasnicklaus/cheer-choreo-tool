import test from "@playwright/test";
import PdfPage from "../pages/pdfPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";

let pdfPage: PdfPage;

test.beforeEach(async ({ page }) => {
  pdfPage = new PdfPage(page);
  await mockDefaultStartRequests(page);
  await pdfPage.goToPage();
});

test.use({
  storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
});

test("should display the page with the correct title", async () => {
  await pdfPage.iCheckTitle();
});

test("should display the correct static data", async () => {
  await pdfPage.iCheckStaticData();
});
// TODO: test pdf generation with default configuration
test("should generate a pdf with the default configuration", async () => {
  await pdfPage.iGeneratePdf();
});
// TODO: test pdf generation with participant names (including warnings)
// TODO: test pdf generation without team name
// TODO: test pdf generation with a different date and without a date
// TODO: test pdf generation with only a single member (and error for no selected member)
