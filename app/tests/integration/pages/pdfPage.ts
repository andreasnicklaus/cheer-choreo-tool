import { expect, Page } from "@playwright/test";
import * as fs from "fs";
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
      name: "Generate PDF",
    });

    const downloadPromise = this.page.waitForEvent("download");
    await this.iClickButton(generateButton);

    await expect(this.page.getByText("PDF is being generated")).toBeVisible();

    const download = await downloadPromise;
    const pdfPath = await download.path();
    if (pdfPath) {
      const stats = fs.statSync(pdfPath);
      expect(stats.size).toBeGreaterThan(50_000);

      const header = fs
        .readFileSync(pdfPath, {
          encoding: "utf8",
          flag: "r",
        })
        .slice(0, 5);
      expect(header).toBe("%PDF-");
    }

    await expect(
      this.page.getByText("PDF is being generated")
    ).not.toBeVisible();
  }

  async iTryPdfGenerationWithNoMembers() {
    await this.page.getByRole("button", { name: "Select none" }).click();
    const generateButton = this.page.getByRole("button", {
      name: "Generate PDF",
    });
    await expect(generateButton).toBeDisabled();
  }

  async iShowWarningForDisplayingParticipantNames() {
    await this.page.getByText("Show participant names").click();

    const warningMessage = this.page.getByText(
      "If you select all participants, the names are not written on the countsheet to save space."
    );
    await expect(warningMessage).toBeVisible();
  }
}
