import { expect, Page } from "@playwright/test";
import TestPage from "./page";

export default class ImpressumPage extends TestPage {
  route = "/impressum";

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      "Imprint - Choreo Planner | The best free online tool for choreo sport"
    );
  }

  iCheckSectionHeading(heading: string) {
    return expect(
      this.page.getByRole("heading", { name: heading })
    ).toBeVisible();
  }

  iCheckSectionContent(content: string) {
    return expect(this.page.getByText(content)).toBeVisible();
  }
}
