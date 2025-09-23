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

test("should generate a pdf with the default configuration", async () => {
  await pdfPage.iGeneratePdf();
});

test("should disable the generate button when no members are selected", async () => {
  await pdfPage.iTryPdfGenerationWithNoMembers();
});

test("should show a warning when displaying participant names, but all are selected", async () => {
  await pdfPage.iShowWarningForDisplayingParticipantNames();
});
// TODO: find a way to test the pdf content
