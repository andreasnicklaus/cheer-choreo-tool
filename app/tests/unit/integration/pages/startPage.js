import { expect } from "@playwright/test";
import Page from "./page";

export default class StartPage extends Page {
  constructor(page) {
    super(page);
    this.route = "/";
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      "Choreo Planner | The best free online tool for choreo sport"
    );
  }

  iCheckInterestedSection() {
    return expect(
      this.page.getByRole("heading", { name: "Interested?" })
    ).toBeVisible();
  }
}
