import { expect, type Page } from "@playwright/test";
import TestPage from "./page";

export default class StartPage extends TestPage {
  route = "/";

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      "Choreo Planner | The best free online tool for choreo sport"
    );
  }

  iCheckAllSections() {
    const headingTitles = [
      "Your Choreo Planner",
      "Create choreos",
      "Share countsheets",
      "Create videos",
      "Interested?",
    ];
    return Promise.all(
      headingTitles.map((title) =>
        expect(this.page.getByRole("heading", { name: title })).toBeVisible()
      )
    );
  }
}
