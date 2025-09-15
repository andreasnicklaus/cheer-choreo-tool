import { expect, Locator, type Page } from "@playwright/test";

export default abstract class TestPage {
  page: Page;
  abstract route: string;

  constructor(page: any) {
    if (this.constructor == TestPage) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }
    this.page = page;
  }

  goToPage() {
    if (!this.page)
      throw new Error(
        "No route was passed. Set this.route to ensure routing works"
      );
    return this.page.goto(this.route);
  }

  protected async iClickButton(button: Locator) {
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
  }
}
