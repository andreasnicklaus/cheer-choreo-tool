import test from "@playwright/test";
import ContactPage from "../pages/contactPage";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import { mockContactMessages } from "../utils/requests";

let contactPage: ContactPage;

test.beforeEach(async ({ page }) => {
  contactPage = new ContactPage(page);
  await mockDefaultStartRequests(page);
  await mockContactMessages(page);
  await contactPage.goToPage();
});

test.describe("logged out", () => {
  test("should display the contact page with the correct title", async () => {
    await contactPage.iCheckTitle();
  });

  test("sendEmailLink should be correct", async () => {
    await contactPage.iCheckSendEmailLink();
  });

  test("documentationLink should be correct", async () => {
    await contactPage.iCheckDocumentationLink();
  });

  test("should successfully send a message", async () => {
    await contactPage.iOpenContactForm();
    await contactPage.iFillAndSendMessage();
    await contactPage.iSeeSuccessMessage();
  });

  test("should show an error message if sending the message fails", async () => {
    await mockContactMessages(contactPage.page, false);
    await contactPage.iOpenContactForm();
    await contactPage.iFillAndSendMessage();
    await contactPage.iSeeErrorMessage();
  });
});

test.describe("logged in", () => {
  test.use({
    storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
  });

  test("should open the contact form with pre-filled name and email", async () => {
    await contactPage.iOpenContactForm();
    await contactPage.iCheckPrefilledName("Default User");
    await contactPage.iCheckPrefilledEmail("default.user@choreo-planer.de");
  });
});
