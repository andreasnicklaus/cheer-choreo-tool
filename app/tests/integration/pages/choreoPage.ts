import { expect, Locator, Page } from "@playwright/test";
import TestPage from "./page";
import { defaultChoreos } from "../testData/choreo";
import { defaultHits } from "../testData/hit";
import { defaultMembers } from "../testData/member";
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
    const helpButton = this.page.getByRole("button", { name: "question" });
    return this.iClickButton(helpButton);
  }

  iSeeChoreoName(name: string) {
    return expect(
      this.page
        .getByRole("heading", { name: `Choreo ${name} pen` })
        .locator("b")
    ).toBeVisible();
  }

  async iEditChoreoName() {
    const editButton = this.page.getByRole("button", { name: "pen" });
    await this.iClickButton(editButton);

    const input = this.page.getByRole("textbox");
    const newChoreoName = "Edited Choreo Name";
    await this.iFillInput(input, newChoreoName);

    const saveButton = this.page.getByRole("button", { name: "check" });
    await this.iClickButton(saveButton);

    await expect(this.page.getByText(newChoreoName)).toBeVisible();
  }

  private async iOpenMenu() {
    const menuButton = this.page.getByRole("button", {
      name: "three dots vertical",
    });
    await this.iClickButton(menuButton);
  }

  async iEditChoreoLength() {
    await this.iOpenMenu();

    const editLengthButton = this.page.getByRole("menuitem", {
      name: "hash Adjust length",
    });
    await this.iClickButton(editLengthButton);

    const achterInput = this.page
      .locator("div")
      .filter({ hasText: /^Eight$/ })
      .getByRole("spinbutton");

    const newAchter = 1;
    await this.iFillInput(achterInput, newAchter.toString());

    const countInput = this.page
      .locator("div")
      .filter({ hasText: /^Counts/ })
      .getByRole("spinbutton");

    const newCount = 1;
    await this.iFillInput(countInput, newCount.toString());

    const saveButton = this.page.getByRole("button", { name: "Change length" });
    await this.iClickButton(saveButton);

    const count8 = this.page.locator(
      "tr:nth-child(2) > td:nth-child(3) > .btn"
    );
    return expect(count8).not.toBeVisible();
  }

  async iEditChoreoMatType() {
    const menuButton = this.page.getByRole("button", {
      name: "three dots vertical",
    });
    await this.iClickButton(menuButton);

    const editMatTypeButton = this.page.getByRole("menuitem", {
      name: "layout three columns Change",
    });
    await this.iClickButton(editMatTypeButton);

    const matTypeSelect = this.page.getByRole("combobox");
    await expect(matTypeSelect).toBeVisible();
    await expect(matTypeSelect).toBeEnabled();

    const optionToSelect = "square";
    await matTypeSelect.selectOption(optionToSelect);
    await expect(matTypeSelect).toHaveValue(optionToSelect);

    const saveButton = this.page.getByRole("button", {
      name: "Change the layout",
    });
    await this.iClickButton(saveButton);
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
              `tr:nth-child(${Math.floor(hit.count / 8) + 1}) > td:nth-child(${(hit.count % 8) + 2
              }) > .btn`
            )
          ).toHaveText(hit.name, { useInnerText: true }),
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
    await this.iClickButton(firstHitButton);

    await expect(firstHitOverviewHeading).toBeVisible();

    await expect(this.page.getByText("All", { exact: true })).toBeVisible();

    // switch to second hit
    const secondHitButton = this.page.getByRole("button", {
      name: defaultHits[1].name,
      exact: true,
    });
    await this.iClickButton(secondHitButton);

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
              `Counts: ${Math.floor(lineup.startCount / 8) + 1} / ${(lineup.startCount % 8) + 1
              } - ${Math.floor(lineup.endCount / 8) + 1} / ${(lineup.endCount % 8) + 1
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

  async iDragAndDropLineupPosition() {
    const expectedCoordinates = { cx: 35.7, cy: 50 }; // improve values based on browser

    const circleToDrag = this.page.locator(`#c${defaultMembers[1].id}`);
    await expect(circleToDrag).toBeVisible();
    const coordinatesBefore = await this.getCircleCoordinates(circleToDrag);
    await expect(coordinatesBefore.cx).toBeCloseTo(expectedCoordinates.cx, 1);
    await expect(coordinatesBefore.cy).toBeCloseTo(expectedCoordinates.cy);

    await circleToDrag.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(300, 500, { steps: 5 });
    await this.page.mouse.up();
    const coordinatesAfter = await this.getCircleCoordinates(circleToDrag);

    // improve values based on browser
    // mat size / browser window size / drag distance
    await expect(coordinatesAfter.cx).not.toBeCloseTo(
      expectedCoordinates.cx,
      1
    );
    await expect(coordinatesAfter.cy).not.toBeCloseTo(expectedCoordinates.cy);
  }

  private getCircleCoordinates(circleElement: Locator) {
    return circleElement.evaluate((circle: HTMLElement) => {
      const attributes = Array.from(circle.attributes);
      const styleAttribute = attributes.find(
        (attr) => attr.name === "style"
      )?.value;

      if (!styleAttribute) return { cx: null, cy: null };

      const styles = styleAttribute.split(";");

      const stylesKeyValueList = styles.map((style) => {
        const [key, value] = style.split(":").map((s) => s.trim());
        return { key, value };
      });

      let cx = stylesKeyValueList.find(({ key }) => key == "cx")?.value;
      if (cx?.endsWith("px")) cx = cx.replace("px", "").trim();
      let cy = stylesKeyValueList.find(({ key }) => key == "cy")?.value;
      if (cy?.endsWith("px")) cy = cy.replace("px", "").trim();

      return { cx: cx ? parseFloat(cx) : 0, cy: cy ? parseFloat(cy) : 0 };
    });
  }

  async iSeeLinkToVideoExport() {
    await this.iOpenMenu();

    const videoExportLink = this.page.getByRole("menuitem", {
      name: "film Export video",
    });
    await expect(videoExportLink).toBeVisible();
    await expect(videoExportLink).toBeEnabled();
    await expect(videoExportLink).toHaveAttribute(
      "href",
      `/en/video/${defaultChoreos[0].id}`
    );
  }

  async iSeeLinkToCountsheet() {
    await this.iOpenMenu();

    const countsheetLink = this.page.getByRole("menuitem", {
      name: "file pdf Countsheet as PDF",
    });
    await expect(countsheetLink).toBeVisible();
    await expect(countsheetLink).toBeEnabled();
    return expect(countsheetLink).toHaveAttribute(
      "href",
      `/pdf/${defaultChoreos[0].id}`
    );
  }

  async iMoveHitUp() {
    const secondHitButton = this.page.getByRole("button", {
      name: defaultHits[1].name,
      exact: true,
    });
    await this.iClickButton(secondHitButton);

    const moveUpButton = this.page.getByTitle("Move to the previous count");
    await this.iClickButton(moveUpButton);

    // hit is moved to count 8 of the first eight
    await expect(
      this.page.locator("td:nth-child(9) > .btn").first()
    ).toHaveText(defaultHits[1].name, { useInnerText: true });

    // the current count is 8 in the first eight
    await expect(
      this.page.getByText("Eight: 1", { exact: true })
    ).toBeVisible();
    await expect(
      this.page.getByText("Count: 8", { exact: true })
    ).toBeVisible();
  }

  async iMoveHitDown() {
    const secondHitButton = this.page.getByRole("button", {
      name: defaultHits[1].name,
      exact: true,
    });
    await this.iClickButton(secondHitButton);

    const moveDownButton = this.page.getByTitle("Move to the next count");
    await this.iClickButton(moveDownButton);

    // hit is moved to count 2 of the second eight
    await expect(
      this.page.locator("tr:nth-child(2) > td:nth-child(3) > .btn")
    ).toHaveText(defaultHits[1].name, { useInnerText: true });

    // the current count is 2 in the second eight
    await expect(
      this.page.getByText("Eight: 2", { exact: true })
    ).toBeVisible();
    await expect(
      this.page.getByText("Count: 2", { exact: true })
    ).toBeVisible();
  }

  async iEditHit() {
    const firstHitButton = this.page.getByRole("button", {
      name: defaultHits[0].name,
      exact: true,
    });
    await this.iClickButton(firstHitButton);

    const editButton = this.page.getByTitle("edit");
    await this.iClickButton(editButton);

    const newEight = 2;
    const newCount = 3;
    const newName = "Edited Hit Name";

    const nameInput = this.page.getByRole("textbox", {
      name: "Name of the hits",
    });
    await this.iFillInput(nameInput, newName);

    const eightInput = this.page.locator("input").nth(3);
    await this.iFillInput(eightInput, newEight.toString());

    const countInput = this.page.locator("input").nth(4);
    await this.iFillInput(countInput, newCount.toString());

    const saveButton = this.page.getByRole("button", {
      name: "check",
      exact: true,
    });
    await this.iClickButton(saveButton);

    await expect(
      this.page.locator("tr:nth-child(2) > td:nth-child(4) > .btn")
    ).toHaveText(newName, { useInnerText: true });
    await expect(
      this.page.locator("tr:nth-child(1) > td:nth-child(5) > .btn")
    ).toHaveText("-");
  }

  async iDeleteHit() {
    const firstHitButton = this.page.getByRole("button", {
      name: defaultHits[0].name,
      exact: true,
    });
    await this.iClickButton(firstHitButton);

    const deleteButton = this.page.getByRole("button", { name: "trash" });
    await this.iClickButton(deleteButton);

    const confirmDeleteButton = this.page.getByRole("button", {
      name: "Delete",
    });
    await this.iClickButton(confirmDeleteButton);

    await expect(
      this.page.getByText("You haven't planned anything")
    ).toBeVisible();

    await expect(
      this.page.locator("tr:nth-child(1) > td:nth-child(5) > .btn")
    ).toHaveText("-");
  }

  async iSelectAllMembersInLineup() {
    this.page.locator("td:nth-child(3) > .btn").first().click();

    const selectAllButton = this.page.getByRole("button", {
      name: "people fill",
    });
    await this.iClickButton(selectAllButton);

    await expect(this.page.getByText("All", { exact: true })).toBeVisible();
    await expect(selectAllButton).not.toBeVisible();
  }

  async iEditLineup() {
    this.page.locator("td:nth-child(3) > .btn").first().click();

    const editButton = this.page.getByTitle("edit");
    await this.iClickButton(editButton);

    const newStartAchter = 2;
    const newStartCount = 1;
    const newEndAchter = 2;
    const newEndCount = 1;

    const startAchterInput = this.page.locator("input").nth(2);
    await this.iFillInput(startAchterInput, newStartAchter.toString());

    const startCountInput = this.page.locator("input").nth(3);
    await this.iFillInput(startCountInput, newStartCount.toString());

    const endAchterInput = this.page.locator("input").nth(4);
    await this.iFillInput(endAchterInput, newEndAchter.toString());

    const endCountInput = this.page.locator("input").nth(5);
    await this.iFillInput(endCountInput, newEndCount.toString());

    const saveButton = this.page.getByRole("button", {
      name: "check",
      exact: true,
    });
    await this.iClickButton(saveButton);

    const switchToCountButton = this.page.locator(
      `tr:nth-child(${newStartAchter}) > td:nth-child(${newStartCount + 1
      }) > .btn`
    );
    await this.iClickButton(switchToCountButton);

    await expect(
      this.page.getByText(
        `Counts: ${newStartAchter} / ${newStartCount} - ${newEndAchter} / ${newEndCount}`
      )
    ).toBeVisible();
  }

  async iDeleteLineup() {
    this.page.locator("td:nth-child(3) > .btn").first().click();

    const deleteButton = this.page.getByRole("button", { name: "trash" });
    await this.iClickButton(deleteButton);

    const confirmationButton = this.page.getByRole("button", {
      name: "Delete",
    });
    await this.iClickButton(confirmationButton);

    await expect(
      this.page.getByText("You haven't planned anything")
    ).toBeVisible();
  }

  async iAddLineup() {
    const addLineupButton = this.page.getByRole("button", {
      name: "plus Add a lineup",
    });
    await this.iClickButton(addLineupButton);

    const newStartAchter = 1;
    const newStartCount = 1;
    const newEndAchter = 2;
    const newEndCount = 2;

    const startAchterInput = this.page.locator("input[type='number']").nth(0);
    await this.iFillInput(startAchterInput, newStartAchter.toString());

    const startCountInput = this.page.locator("input[type='number']").nth(1);
    await this.iFillInput(startCountInput, newStartCount.toString());

    const endAchterInput = this.page.locator("input[type='number']").nth(2);
    await this.iFillInput(endAchterInput, newEndAchter.toString());

    const endCountInput = this.page.locator("input[type='number']").nth(3);
    await this.iFillInput(endCountInput, newEndCount.toString());

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await this.iClickButton(saveButton);

    await expect(
      this.page.getByText(
        `Counts: ${newStartAchter} / ${newStartCount} - ${newEndAchter} / ${newEndCount}`
      )
    ).toBeVisible();
  }

  async iAddHit() {
    const addHitButton = this.page.getByRole("button", {
      name: "plus Add count entry",
    });
    await this.iClickButton(addHitButton);

    const newName = "New Hit Name";
    const newNameInput = this.page.getByRole("textbox", {
      name: "What is the name of the new",
    });
    // iFillInput() is not used because the textbox becomes a combobox after input
    // await this.iFillInput()
    await expect(newNameInput).toBeVisible();
    await expect(newNameInput).toBeEnabled();
    await newNameInput.fill(newName);

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await this.iClickButton(saveButton);

    const newHitDisplay = this.page.locator("#editView h5").getByText(newName);
    await expect(newHitDisplay).toBeVisible();
  }
}
