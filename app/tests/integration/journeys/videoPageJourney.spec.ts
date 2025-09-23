import { test as base } from "@playwright/test";
import { mockDefaultStartRequests } from "../utils/multiRequests";
import VideoPage from "../pages/videoPage";

let videoPage: VideoPage;

export type TestOptions = {
  supportsCanvasRecording: boolean;
};

export const test = base.extend<TestOptions>({
  supportsCanvasRecording: [false, { option: true }],
});

test.beforeEach(async ({ page }) => {
  videoPage = new VideoPage(page);
  await mockDefaultStartRequests(page);
  await videoPage.goToPage();
});

test.use({
  storageState: "tests/integration/testData/.localstorage-dev.loggedIn.json",
});

test("should display the page with the correct title", async () => {
  await videoPage.iCheckTitle();
});

test("should display the correct static data", async () => {
  await videoPage.iCheckStaticData();
});

test("should generate a video with the default configuration", async ({
  supportsCanvasRecording,
}) => {
  test.slow();
  await videoPage.iGenerateVideo(Boolean(supportsCanvasRecording));
});

test("should disable the generate button when no members are selected", async () => {
  await videoPage.iTryVideoGenerationWithNoMembers();
});

// TODO: find a way to test the video content
