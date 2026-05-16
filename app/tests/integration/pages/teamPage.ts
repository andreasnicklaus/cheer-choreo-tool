import { expect, Page } from "@playwright/test";
import TestPage from "./page";
import { defaultTeams } from "../testData/team";
import { defaultMembers } from "../testData/member";
import { defaultSeasons } from "../testData/season";
import { defaultSeasonTeams } from "../testData/seasonTeam";

export default class TeamPage extends TestPage {
  firstClubId = "20f5bc46-de1b-4316-beaa-df927bbe57fc";
  route = `/team/${defaultTeams[0].id}`;

  constructor(page: Page) {
    super(page);
  }

  iCheckTitle() {
    return expect(this.page).toHaveTitle(
      `${defaultTeams[0].name} - Choreo Planner | The best free online tool for choreo sport`
    );
  }

  async iCheckMemberDisplay(
    listView: Boolean = false,
    isMobile: Boolean = false
  ) {
    if (listView) {
      const listButton = this.page
        .getByRole("button")
        .filter({ hasText: /^$/ })
        .nth(isMobile ? 3 : 2);
      await this.iClickButton(listButton);

      return Promise.all(
        defaultMembers.map((member) =>
          Promise.all([
            expect(
              this.page
                .getByLabel("Season 30/31 ( 2)")
                .getByText(`${member.name} (${member.nickname})`, {
                  exact: true,
                })
            ).toBeVisible(),
            expect(
              this.page
                .getByLabel("Season 30/31 ( 2)")
                .getByText(member.abbreviation, { exact: true })
            ).toBeVisible(),
          ])
        )
      );
    }

    return Promise.all(
      defaultMembers.map((member) =>
        Promise.all([
          expect(
            this.page.getByRole("cell", {
              name: (isMobile ? "Name " : "") + member.name,
              exact: true,
            })
          ).toBeVisible(),
          expect(
            this.page.getByRole("cell", {
              name: (isMobile ? "Nickname " : "") + member.nickname,
              exact: true,
            })
          ).toBeVisible(),
          expect(
            this.page.getByRole("cell", {
              name: (isMobile ? "Abbreviation " : "") + member.abbreviation,
              exact: true,
            })
          ).toBeVisible(),
        ])
      )
    );
  }

  async iAddMember(isMobile: Boolean) {
    const name = "New Member",
      abbreviation = "AA",
      nickname = "Newbie";

    const addButton = this.page.getByRole("button", { name: "Add" });
    await this.iClickButton(addButton);

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();

    const nameInput = this.page.getByRole("textbox", {
      name: "Name:",
      exact: true,
    });
    await this.iFillInput(nameInput, name);

    await expect(saveButton).toBeEnabled();

    const abbreviationInput = this.page.getByRole("textbox", {
      name: "Abbreviation:",
    });
    await this.iFillInput(abbreviationInput, abbreviation);

    const nicknameInput = this.page.getByRole("textbox", { name: "Nickname:" });
    await this.iFillInput(nicknameInput, nickname);

    await this.iClickButton(saveButton);

    return expect(
      this.page.getByRole("cell", {
        name: (isMobile ? "Name " : "") + name,
        exact: true,
      })
    ).toBeVisible();
  }

  async iImportMember() {
    const importMemberButton = this.page.getByRole("button", {
      name: "Import",
    });
    await this.iClickButton(importMemberButton);

    const importButton = this.page
      .getByLabel("Import a team member")
      .getByRole("button", {
        name: "Import",
        exact: true,
      });
    await expect(importButton).toBeVisible();
    await expect(importButton).toBeDisabled();

    const teamSelect = this.page
      .getByRole("dialog", { name: "Import a team member" })
      .getByLabel("Team", { exact: true });
    await expect(teamSelect).toBeVisible();
    await teamSelect.selectOption(defaultTeams[1].id);
    await expect(teamSelect).toHaveValue(defaultTeams[1].id);

    const seasonSelect = this.page
      .getByRole("dialog", { name: "Import a team member" })
      .getByLabel("Season", { exact: true });
    await expect(seasonSelect).toBeVisible();
    await expect(seasonSelect).toHaveValue(
      defaultTeams[1].SeasonTeams[0].SeasonID
    );

    const member1Checkbox = this.page
      .getByLabel("Import a team member")
      .getByText("Test Member1");
    await expect(member1Checkbox).toBeVisible();
    await member1Checkbox.check();
    await expect(member1Checkbox).toBeChecked();

    return this.iClickButton(importButton);
  }

  async iEditMember() {
    const editButton = this.page
      .getByLabel("Season 30/31 ( 2)")
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .nth(0);
    await this.iClickButton(editButton);

    const nameInput = this.page.getByRole("textbox", {
      name: "Name:",
      exact: true,
    });
    await this.iFillInput(nameInput, "Edited Member");

    const abbreviationInput = this.page.getByRole("textbox", {
      name: "Abbreviation:",
    });
    await this.iFillInput(abbreviationInput, "EM");

    const nicknameInput = this.page.getByRole("textbox", { name: "Nickname:" });
    await this.iFillInput(nicknameInput, "Edited");

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await this.iClickButton(saveButton);
  }

  async iDeleteMember() {
    const deleteButton = this.page
      .getByLabel("Season 30/31 ( 2)")
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .nth(1);
    await this.iClickButton(deleteButton);

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await this.iClickButton(confirmButton);

    return expect(
      this.page.getByRole("cell", { name: "Test Member1" })
    ).toBeHidden();
  }

  async iSwitchSeason() {
    const seasonTab = this.page.getByRole("tab", {
      name: `${defaultSeasons[1].name} ( ${defaultSeasonTeams[1].Members.length})`,
    });
    await expect(seasonTab).not.toHaveAttribute("aria-selected", "true");
    await this.iClickButton(seasonTab);
    return expect(seasonTab).toHaveAttribute("aria-selected", "true");
  }

  async iSwitchTeam() {
    await expect(
      this.page
        .getByRole("heading", { name: `Team ${defaultTeams[0].name}` })
        .locator("b")
    ).toBeVisible();

    const teamSelect = this.page.getByRole("button", {
      name: defaultTeams[0].name,
    });
    await this.iClickButton(teamSelect);

    const teamOption = this.page.getByRole("menuitem", {
      name: defaultTeams[1].name,
    });
    await this.iClickButton(teamOption);

    return expect(
      this.page
        .getByRole("heading", { name: `Team ${defaultTeams[1].name}` })
        .locator("b")
    ).toBeVisible();
  }

  async iEditTeam() {
    const editButton = this.page
      .getByRole("heading", { name: `Team ${defaultTeams[0].name}` })
      .getByRole("button");
    await this.iClickButton(editButton);

    const newTeamName = "Edited Team Name";

    const nameInput = this.page.getByTestId("editHeading-input");
    await this.iFillInput(nameInput, newTeamName);

    const saveButton = this.page.getByTestId("approve-edit-button");
    await this.iClickButton(saveButton);
  }

  async iDeleteTeam() {
    const openMenuButton = this.page.getByTestId("options-dropdown");
    await this.iClickButton(openMenuButton);

    const deleteButton = this.page.getByRole("menuitem", {
      name: "Delete team",
    });
    await this.iClickButton(deleteButton);

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await this.iClickButton(confirmButton);

    return expect(
      this.page
        .getByRole("heading", { name: `Team ${defaultTeams[1].name}` })
        .locator("b")
    ).toBeVisible();
  }

  async iDeleteSeason() {
    const openMenuButton = this.page.getByTestId("options-dropdown");
    await this.iClickButton(openMenuButton);

    const deleteButton = this.page.getByRole("menuitem", {
      name: "Delete season",
    });
    await this.iClickButton(deleteButton);

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await this.iClickButton(confirmButton);
    // check to ensure the season is deleted is not possible as the app simply reloads
  }

  async iOpenOptionsMenu() {
    const openMenuButton = this.page.getByTestId("options-dropdown");
    await this.iClickButton(openMenuButton);
  }

  async iSeeCreatorDisplay(expectedText: string) {
    await this.iOpenOptionsMenu();
    const creatorDisplay = this.page.getByTestId("creator-display");
    await expect(creatorDisplay).toBeVisible();
    await expect(creatorDisplay).toContainText(expectedText);
  }

  async iSeeUpdaterDisplay(expectedText: string) {
    await this.iOpenOptionsMenu();
    const updaterDisplay = this.page.getByTestId("updater-display");
    await expect(updaterDisplay).toBeVisible();
    await expect(updaterDisplay).toContainText(expectedText);
  }

  async iSetClubId() {
    await this.page.evaluate((id) => {
      const app = (document.querySelector("#app") as any)?.__vue_app__;
      app?.config?.globalProperties?.$store?.commit("setClubId", id);
    }, this.firstClubId);
  }

  async iOpenCreateTeamModal() {
    const teamDropdown = this.page.getByRole("button", { name: "Teams" });
    await this.iClickButton(teamDropdown);
    const newTeamItem = this.page.getByRole("menuitem", {
      name: "New team",
    });
    await this.iClickButton(newTeamItem);
  }

  async iOpenCreateSeasonModal() {
    const addSeasonButton = this.page.getByTestId("create-season-button");
    await this.iClickButton(addSeasonButton);
  }

  async iSeeOwnerSelectInCreateTeamModal() {
    const modal = this.page.getByRole("dialog", { name: "New team" });
    await expect(modal.getByLabel("Owner")).toBeVisible();
  }

  async iSeeOwnerSelectOptionInCreateTeamModal(text: string) {
    const modal = this.page.getByRole("dialog", { name: "New team" });
    const options = await modal
      .getByRole("combobox", { name: "Owner" })
      .locator("option")
      .allTextContents();
    expect(options.some((o) => o.includes(text))).toBeTruthy();
  }

  async iDontSeeOwnerSelectInCreateTeamModal() {
    const modal = this.page.getByRole("dialog", { name: "New team" });
    await expect(modal.getByLabel("Owner")).not.toBeVisible();
  }

  async iSeeOwnerSelectInCreateSeasonModal() {
    const modal = this.page.getByRole("dialog", { name: "New season" });
    await expect(modal.getByLabel("Owner")).toBeVisible();
  }

  async iSeeOwnerSelectOptionInCreateSeasonModal(text: string) {
    const modal = this.page.getByRole("dialog", { name: "New season" });
    const options = await modal
      .getByRole("combobox", { name: "Owner" })
      .locator("option")
      .allTextContents();
    expect(options.some((o) => o.includes(text))).toBeTruthy();
  }

  async iDontSeeOwnerSelectInCreateSeasonModal() {
    const modal = this.page.getByRole("dialog", { name: "New season" });
    await expect(modal.getByLabel("Owner")).not.toBeVisible();
  }

  async iSeeOwnerDisplay(username: string) {
    const ownerDisplay = this.page.getByTestId("owner-display");
    await expect(ownerDisplay).toBeVisible();
    await expect(ownerDisplay).toContainText(username);
  }

  async iDontSeeOwnerDisplay() {
    const ownerDisplay = this.page.getByTestId("owner-display");
    await expect(ownerDisplay).not.toBeVisible();
  }
}
