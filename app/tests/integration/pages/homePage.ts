import { expect, type Page } from "@playwright/test";
import TestPage from "./page";

export default class HomePage extends TestPage {
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

  iCheckMainSectionContents() {
    return Promise.all([
      expect(this.page.locator("#logoImg")).toBeVisible(),
      expect(this.page.locator("#logoImg")).toHaveAttribute(
        "src",
        /\/Icon.*\.png/
      ),
      expect(this.page.locator("#logoImg")).toHaveAttribute(
        "alt",
        "Choreo planner icon"
      ),

      expect(this.page.locator("#callout1")).toContainText("1. Create choreos"),
      expect(this.page.locator("#callout2")).toContainText(
        "2. Share countsheets"
      ),
      expect(this.page.locator("#callout3")).toContainText("3. Create videos"),

      expect(this.page.locator("#registerButton")).toBeVisible(),
      expect(this.page.locator("#registerButton")).toContainText(
        "Log in / Register"
      ),
      expect(this.page.locator("#helpLink")).toContainText("Help"),
      expect(this.page.locator("#helpLink")).toBeVisible(),
    ]);
  }

  iCheckMatSectionContents() {
    return Promise.all([
      expect(this.page.locator("#cheer-Mat")).toBeVisible(),
      expect(this.page.locator("#cheer-Mat > *")).toHaveCount(1),
      expect(this.page.locator("#garde-Mat > *")).toHaveCount(1),
      expect(this.page.locator("#v34-Mat > *")).toHaveCount(1),
      expect(this.page.locator("#square-Mat > *")).toHaveCount(1),
    ]);
  }

  iCheckFeatureCallouts(isMobile: boolean) {
    const featureCallout = this.page.locator("#featureCallouts1");
    const assertions = [
      expect(featureCallout).toBeVisible({ visible: !isMobile }),
    ];
    if (!isMobile) {
      assertions.push(
        expect(
          this.page.locator("#featureCallouts1 > .featureCallout")
        ).toHaveCount(9),
        expect(featureCallout).toContainText("Member management"),
        expect(featureCallout).toContainText("Planning choreos"),
        expect(featureCallout).toContainText("Personalization"),
        expect(featureCallout).toContainText("Your club's branding"),
        expect(featureCallout).toContainText("File generation"),
        expect(featureCallout).toContainText("Video export"),
        expect(featureCallout).toContainText("Data backup"),
        expect(featureCallout).toContainText("Season changes"),
        expect(featureCallout).toContainText("Championship preparation"),
        expect(featureCallout).toContainText("Data archiving")
      );
    }

    return Promise.all(assertions);
  }

  iCheckCountsheetSectionContents(isMobile: boolean) {
    return Promise.all([
      expect(this.page.locator("#sectionC")).toContainText(
        "Create Countsheets as a video or PDF for everyone or only for certain participants"
      ),
      expect(this.page.locator("#CountOverview")).toBeVisible(),
      expect(this.page.locator("#CountSheet")).toBeVisible({
        visible: !isMobile,
      }),
    ]);
  }

  iCheckRegistrationSteps(isMobile: boolean) {
    const featureCallout = this.page.locator("#featureCallouts2");
    const assertions = [
      expect(featureCallout).toBeVisible({ visible: !isMobile }),
    ];
    if (!isMobile) {
      assertions.push(
        expect(
          this.page.locator("#featureCallouts2 > .featureCallout")
        ).toHaveCount(5),
        expect(featureCallout).toContainText(
          "Log in with the username and password"
        ),
        expect(featureCallout).toContainText("Create a team"),
        expect(featureCallout).toContainText("Plan choreos"),
        expect(featureCallout).toContainText("Download videos"),
        expect(featureCallout).toContainText("Share countsheets")
      );
    }

    return Promise.all(assertions);
  }

  iCheckCreateVideoSectionContents() {
    return Promise.all([
      expect(this.page.locator("#sectionD")).toContainText(
        "Wait until your video is finished"
      ),
      expect(this.page.locator("#video-form")).toBeVisible(),
      expect(this.page.locator("#video-form")).toContainText(
        "Select who should appear on the video"
      ),
      expect(this.page.locator("#video-form")).toContainText(
        "Should the video be created with your logo?"
      ),
      expect(this.page.locator("#video-form")).toContainText(
        "Should the video have a continuous count?"
      ),
      expect(this.page.locator("#video-form")).toContainText(
        "Should the video show entries from the countsheet?"
      ),
    ]);
  }

  iCheckInterestedSectionContents() {
    const section = this.page.locator("#interestedSection");
    return Promise.all([
      expect(section).toContainText(
        "Register now to get started and create the first team:"
      ),
      expect(section).toContainText("Interested?"),
      expect(
        this.page.getByRole("button", { name: "Log in / Register" })
      ).toHaveClass("pulse-button"),
    ]);
  }
}
