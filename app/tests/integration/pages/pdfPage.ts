import { expect, Page } from "@playwright/test";
import { defaultChoreos } from "../testData/choreo";
import TestPage from "./page";

export default class PdfPage extends TestPage {
  route = `/pdf/${defaultChoreos[0].id}`;

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      `${defaultChoreos[0].name} - PDF - Choreo Planner | The best free online tool for choreo sport`
    );
  }

  async iCheckStaticData() {
    await Promise.all([
      expect(
        this.page.getByText(`Selected choreo: ${defaultChoreos[0].name}`)
      ).toBeVisible(),
      expect(
        this.page.getByText(
          `Team: ${defaultChoreos[0].Team.name} (${defaultChoreos[0].SeasonTeam.Season.name})`
        )
      ).toBeVisible(),
    ]);
  }

  async iGeneratePdf() {
    const generateButton = this.page.getByRole("button", {
      name: "file pdf Generate PDF",
    });
    await this.iClickButton(generateButton);

    await expect(this.page.getByText("PDF is being generated")).toBeVisible();

    // make sure the loading popup disappears in time
    await expect(
      this.page.getByText("PDF is being generated")
    ).not.toBeVisible();

    // TODO: find a way to test the pdf content
  }
}
