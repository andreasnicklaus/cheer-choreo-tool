import { expect, Locator, Page } from "@playwright/test";
import TestPage from "./page";

export default class ContactPage extends TestPage {
  route = `/contact`;

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      `Help & Support - Choreo Planner | The best free online tool for choreo sport`
    );
  }

  iCheckSendEmailLink() {
    return expect(this.page.getByText("Send an email")).toHaveAttribute(
      "href",
      "mailto:info@choreo-planer.de"
    );
  }

  iCheckDocumentationLink() {
    return expect(this.page.getByText("Help & quick fixes")).toHaveAttribute(
      "href",
      "/en/hilfe"
    );
  }

  iOpenContactForm() {
    const openDialogButton = this.page.getByRole("button", {
      name: "Send a message",
    });
    return this.iClickButton(openDialogButton);
  }

  async iFillAndSendMessage() {
    // TODO: implement filling out the form and sending a message
    const nameInput = this.page.getByLabel("Name");
    await this.iFillInput(nameInput, "Test User");

    const emailInput = this.page.getByLabel("Email");
    await this.iFillInput(emailInput, "test@choreo-planer.de");

    const subjectInput = this.page.getByLabel("Subject");
    await this.iFillInput(subjectInput, "Test Message");

    const categorySelect = this.page.getByLabel("Category");
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toBeEnabled();
    await categorySelect.selectOption("Ask a question");
    await expect(categorySelect).toHaveValue("question");

    const messageInput = this.page.getByRole("textbox", { name: "Message:" });
    await this.iFillInput(messageInput, "This is a test message.");

    const sendButton = this.page.getByRole("button", {
      name: "chat right text Send",
    });
    await this.iClickButton(sendButton);
  }

  iSeeSuccessMessage() {
    const successMessage = this.page.getByText(
      "Your message was sent successfully"
    );
    return expect(successMessage).toBeVisible();
  }

  async iSeeErrorMessage() {
    const generalErrorMessage = this.page.getByText(
      "There was an error with your message"
    );
    await expect(generalErrorMessage).toBeVisible();

    const specificErrorMessage = this.page.getByText("Failed to send message");
    return expect(specificErrorMessage).toBeVisible();
  }

  iCheckPrefilledName(expectedName: string) {
    const nameInput = this.page.getByLabel("Name");
    return expect(nameInput).toHaveValue(expectedName);
  }

  iCheckPrefilledEmail(expectedEmail: string) {
    const emailInput = this.page.getByLabel("Email");
    return expect(emailInput).toHaveValue(expectedEmail);
  }
}
