import { expect, Page } from "@playwright/test";
import { defaultChoreos } from "../testData/choreo";
import TestPage from "./page";

export default class VideoPage extends TestPage {
  route = `/video/${defaultChoreos[0].id}`;

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      `${defaultChoreos[0].name} - Video - Choreo Planner | The best free online tool for choreo sport`
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

  async iGenerateVideo(supportsCanvasRecording: boolean) {
    const generateButton = this.page.getByRole("button", {
      name: "film Generate video",
    });
    await this.iClickButton(generateButton);

    if (!supportsCanvasRecording) {
      // FIXME: These tests fail in Github CI (see https://github.com/andreasnicklaus/cheer-choreo-tool/actions/runs/17878546710)
      // const errorMessage = this.page.getByText("Your browser does not support");
      // await expect(errorMessage).toBeVisible({ timeout: 10_000 });
    } else {
      // check if popup is shown
      const cancelButton = this.page.getByRole("button", { name: "Cancel" });
      await expect(cancelButton).toBeVisible();
      await expect(cancelButton).toBeEnabled();
      const progressBar = this.page.locator(".progress");
      await expect(progressBar).toBeVisible();

      const downloadButton = this.page.getByRole("button", {
        name: "download Download",
      });
      // Wait for the video generation to finish
      await expect(downloadButton).toBeVisible({ timeout: 90_000 });

      await this.iClickButton(downloadButton);

      const videoElement = this.page.locator("video");
      await expect(videoElement).toBeVisible();

      const downloadVideoButton = this.page.getByRole("link", {
        name: "download Download MP4",
      });

      const downloadPromise = this.page.waitForEvent("download");
      await this.iClickButton(downloadVideoButton);
      const downloadedVideoFile = await downloadPromise
        .then((data) => true)
        .catch((e) => false);
      await expect(downloadedVideoFile).toBeTruthy();
      await expect(downloadVideoButton).toHaveAttribute(
        "download",
        `${defaultChoreos[0].name}.mp4`
      );

      const fileFormatSelect = this.page.getByRole("button", {
        name: "film MP4",
      });
      await this.iClickButton(fileFormatSelect);

      const webmOption = this.page.getByRole("menuitem", {
        name: "Webm .webm",
      });
      this.iClickButton(webmOption);

      const downloadWebmVideoButton = this.page.getByRole("link", {
        name: "download Download Webm",
      });
      const downloadWebmPromise = this.page.waitForEvent("download");
      await this.iClickButton(downloadWebmVideoButton);
      const downloadedWebmVideoFile = await downloadWebmPromise
        .then((data) => true)
        .catch((e) => false);
      await expect(downloadedWebmVideoFile).toBeTruthy();
      await expect(downloadWebmVideoButton).toHaveAttribute(
        "download",
        `${defaultChoreos[0].name}.webm`
      );
    }
  }

  async iTryVideoGenerationWithNoMembers() {
    await this.page.getByRole("button", { name: "slash Select none" }).click();

    const generateButton = this.page.getByRole("button", {
      name: "film Generate video",
    });
    await expect(generateButton).toBeDisabled();
  }
}
