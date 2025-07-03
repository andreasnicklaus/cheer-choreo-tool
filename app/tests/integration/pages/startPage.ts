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
    return expect(
      this.page.getByRole("heading", { name: "Interested?" })
    ).toBeVisible();
  }
}
