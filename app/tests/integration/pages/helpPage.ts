import { expect, Page } from "@playwright/test";
import TestPage from "./page";

export default class HelpPage extends TestPage {
  route = "/hilfe";

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      "Help - Choreo Planner | The best free online tool for choreo sport"
    );
  }

  async iCheckQuestionsAndAnswers() {
    const question = this.page.getByRole("button", {
      name: "Who is the choreo planner for?",
    });
    await expect(question).toBeVisible();
    await question.click();
    await expect(
      this.page.getByText("The choreo planner is for")
    ).toBeVisible();
    await question.click();
    return expect(
      this.page.getByText("The choreo planner is for")
    ).not.toBeVisible();
  }

  async iTypeInSearchInput() {
    const searchInput = this.page.getByRole("textbox", { name: "Search" });
    await expect(searchInput).toBeVisible();

    const text = "report problems";
    await searchInput.fill(text);
    await expect(searchInput).toHaveValue(text);
    const result = this.page.getByRole("button", {
      name: "How can I report problems?",
    });
    return Promise.all([
      expect(result).toBeVisible(),
      expect(
        this.page.getByRole("button", {
          name: "I accidentally deleted",
        })
      ).not.toBeVisible(),
    ]);
  }
}
