import { defineConfig, devices } from "@playwright/test";

const reporter = [["html", { open: "never" }]];
if (process.env.CI)
  reporter.push([
    "@estruyf/github-actions-reporter",
    {
      showError: true,
      showArtifactsLink: true,
      useDetails: true,
    },
  ]);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true, // Run tests in files in parallel
  forbidOnly: !!process.env.CI, // Fail the build on CI if you accidentally left test.only in the source code.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2, // Opt out of parallel tests on CI.
  reporter, // Reporter to use. See https://playwright.dev/docs/test-reporters

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: "http://localhost:3000", // Base URL to use in actions like `await page.goto('/')`.
    trace: "on-first-retry", // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    locale: "en-GB",
    storageState: "tests/integration/testData/.localstorage-dev.json",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      canShare: false,
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      canShare: false,
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      canShare: false,
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      canShare: false,
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
      canShare: false,
    },

    /* Test against branded browsers. */
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
      canShare: true,
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      canShare: true,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // command: "npm run serve",
    command: "serve -s dist",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
