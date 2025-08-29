import { expect, Page } from "@playwright/test";
import TestPage from "./page";
import { defaultChoreos } from "../testData/choreo";
import { defaultHits } from "../testData/hit";
import { defaultMembers } from "../testData/member";
import { defaultPositions } from "../testData/position";
import { defaultLineups } from "../testData/lineup";

export default class ChoreoPage extends TestPage {
  route = `/choreo/${defaultChoreos[0].id}`;

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle(isMobile: Boolean) {
    if (isMobile)
      return expect(this.page).toHaveTitle(
        `Loading choreo - Choreo Planner | The best free online tool for choreo sport`
      );
    return expect(this.page).toHaveTitle(
      `${defaultChoreos[0].name} - Choreo Planner | The best free online tool for choreo sport`
    );
  }

  iShouldSeeHelpDisplay(isMobile: Boolean) {
    if (isMobile) return; // Not available on mobile

    return expect(
      this.page.getByRole("heading", { name: "Instructions" })
    ).toBeVisible();
  }

  iClickHelpButton() {
    return this.page.getByRole("button", { name: "question" }).click();
  }

  iSeeChoreoName(name: string) {
    return expect(this.page.getByText(name)).toBeVisible();
  }

  async iEditChoreoName() {
    const editButton = this.page.getByRole("button", { name: "pen" });
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeEnabled();
    await editButton.click();

    const input = this.page.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    const newChoreoName = "Edited Choreo Name";
    await input.fill(newChoreoName);
    await expect(input).toHaveValue(newChoreoName);

    const saveButton = this.page.getByRole("button", { name: "check" });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(this.page.getByText(newChoreoName)).toBeVisible();
  }

  async iEditChoreoLength() {
    const menuButton = this.page.getByRole("button", {
      name: "three dots vertical",
    });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();
    await menuButton.click();

    const editLengthButton = this.page.getByRole("menuitem", {
      name: "hash Adjust length",
    });
    await expect(editLengthButton).toBeVisible();
    await expect(editLengthButton).toBeEnabled();
    await editLengthButton.click();

    const achterInput = this.page
      .locator("div")
      .filter({ hasText: /^Achter$/ })
      .getByRole("spinbutton");
    await expect(achterInput).toBeVisible();
    await expect(achterInput).toBeEnabled();

    const countInput = this.page
      .locator("div")
      .filter({ hasText: /^Counts/ })
      .getByRole("spinbutton");
    await expect(countInput).toBeVisible();
    await expect(countInput).toBeEnabled();

    const newAchter = 1;

    await achterInput.fill(newAchter.toString());
    await expect(achterInput).toHaveValue(newAchter.toString());

    const newCount = 1;
    await countInput.fill(newCount.toString());
    await expect(countInput).toHaveValue(newCount.toString());

    const saveButton = this.page.getByRole("button", { name: "Change length" });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    const count8 = this.page.locator(
      "tr:nth-child(2) > td:nth-child(3) > .btn"
    );
    return expect(count8).not.toBeVisible();
  }

  async iEditChoreoMatType() {
    const menuButton = this.page.getByRole("button", {
      name: "three dots vertical",
    });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();
    await menuButton.click();

    const editMatTypeButton = this.page.getByRole("menuitem", {
      name: "layout three columns Change",
    });
    await expect(editMatTypeButton).toBeVisible();
    await expect(editMatTypeButton).toBeEnabled();
    await editMatTypeButton.click();

    const matTypeSelect = this.page.getByRole("combobox");
    await expect(matTypeSelect).toBeVisible();
    await expect(matTypeSelect).toBeEnabled();

    const optionToSelect = "square";
    await matTypeSelect.selectOption(optionToSelect);
    await expect(matTypeSelect).toHaveValue(optionToSelect);

    const saveButton = this.page.getByRole("button", {
      name: "Change the layout",
    });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    return saveButton.click();
    // TODO: find a way to verify the mat type change
  }

  async iSeeHitsOnCountsheetsAndOverview() {
    await Promise.all(
      defaultHits
        .map((hit) => [
          expect(
            this.page.getByRole("button", { name: hit.name, exact: true })
          ).toBeVisible(),
          expect(
            this.page.locator(
              `tr:nth-child(${Math.floor(hit.count / 8) + 1}) > td:nth-child(${
                (hit.count % 8) + 2
              }) > .btn`
            )
          ).toHaveText(hit.name),
        ])
        .flat()
    );

    // Check empty overview
    await expect(
      this.page.getByText("You haven't planned anything")
    ).toBeVisible();
    const firstHitOverviewHeading = this.page
      .locator("#editView h5")
      .getByText(defaultHits[0].name);
    await expect(firstHitOverviewHeading).not.toBeVisible();

    // switch to existing hit
    const firstHitButton = this.page.getByRole("button", {
      name: defaultHits[0].name,
      exact: true,
    });
    await expect(firstHitButton).toBeVisible();
    await expect(firstHitButton).toBeEnabled();
    await firstHitButton.click();

    await expect(firstHitOverviewHeading).toBeVisible();

    await expect(this.page.getByText("All", { exact: true })).toBeVisible();

    // switch to second hit
    const secondHitButton = this.page.getByRole("button", {
      name: defaultHits[1].name,
      exact: true,
    });
    await expect(secondHitButton).toBeVisible();
    await expect(secondHitButton).toBeEnabled();
    await secondHitButton.click();

    await expect(this.page.getByText("All", { exact: true })).not.toBeVisible();
    await expect(
      this.page.getByText(defaultMembers[0].nickname).first()
    ).toBeVisible();
  }

  async iSeeMobileConstructions() {
    await expect(
      this.page.getByRole("heading", { name: "Not possible on a small screen" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: "file pdf Countsheet as PDF" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: "film Export video" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: "To the landing page" })
    ).toBeVisible();
  }

  async iSeeLineupsOnMatAndOverview() {
    await Promise.all(
      defaultMembers
        .map((member) => [
          expect(this.page.locator(`#c${member.id}`)).toBeVisible(),
          expect(this.page.locator(`#t${member.id}`)).toBeVisible(),
          expect(this.page.locator(`#t${member.id}`)).toHaveText(
            member.abbreviation
          ),
        ])
        .flat()
    );

    const currentCount = 1;
    await this.page.locator("td:nth-child(3) > .btn").first().click();
    await Promise.all(
      defaultLineups
        .filter(
          (lineup) =>
            lineup.startCount <= currentCount && lineup.endCount >= currentCount
        )
        .map((lineup) => [
          expect(
            this.page.getByText(
              `Counts: ${Math.floor(lineup.startCount / 8) + 1} / ${
                (lineup.startCount % 8) + 1
              } - ${Math.floor(lineup.endCount / 8) + 1} / ${
                (lineup.endCount % 8) + 1
              }`
            )
          ).toBeVisible(),
          ...lineup.Positions.map(
            async (position) =>
              await expect(
                this.page
                  .getByText(position.Member.name, { exact: true })
                  .first()
              ).toBeVisible()
          ),
        ])
        .flat()
    );
  }
}
