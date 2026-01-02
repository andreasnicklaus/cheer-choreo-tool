import { expect, Page } from "@playwright/test";
import TestPage from "./page";
import { defaultTeams } from "../testData/team";
import { defaultMembers } from "../testData/member";
import { defaultSeasons } from "../testData/season";
import { defaultSeasonTeams } from "../testData/seasonTeam";

export default class TeamPage extends TestPage {
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
      const listButton = this.page.getByRole("button", { name: "list ul" });
      await this.iClickButton(listButton);

      return Promise.all(
        defaultMembers.map((member) =>
          Promise.all([
            expect(
              this.page.getByText(`${member.name} (${member.nickname})`, {
                exact: true,
              })
            ).toBeVisible(),
            expect(
              this.page.getByText(member.abbreviation, { exact: true })
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

    const addButton = this.page.getByRole("button", { name: "plus Add" });
    await this.iClickButton(addButton);

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();

    const nameInput = this.page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    await this.iFillInput(nameInput, name);

    await expect(saveButton).toBeEnabled();

    const abbreviationInput = this.page.getByRole("textbox", { name: "NM" });
    await this.iFillInput(abbreviationInput, abbreviation);

    const nicknameInput = this.page.getByRole("textbox", { name: "Nickname" });
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
      name: "box arrow in right Import",
    });
    await this.iClickButton(importMemberButton);

    const importButton = this.page.getByRole("button", {
      name: "Import",
      exact: true,
    });
    await expect(importButton).toBeVisible();
    await expect(importButton).toBeDisabled();

    const teamSelect = this.page
      .getByRole("group", { name: "Team" })
      .getByRole("combobox");
    await expect(teamSelect).toBeVisible();
    await teamSelect.selectOption(defaultTeams[1].id);
    await expect(teamSelect).toHaveValue(defaultTeams[1].id);

    const seasonSelect = this.page
      .getByRole("group", { name: "Season" })
      .getByRole("combobox");
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
    const editButton = this.page.getByRole("button", { name: "pen" }).nth(1);
    await this.iClickButton(editButton);

    const nameInput = this.page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    await this.iFillInput(nameInput, "Edited Member");

    const abbreviationInput = this.page.getByRole("textbox", { name: "EM" });
    await this.iFillInput(abbreviationInput, "EM");

    const nicknameInput = this.page.getByRole("textbox", { name: "Nickname" });
    await this.iFillInput(nicknameInput, "Edited");

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await this.iClickButton(saveButton);
  }

  async iDeleteMember() {
    const deleteButton = this.page
      .getByRole("button", { name: "trash" })
      .first();
    await this.iClickButton(deleteButton);

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await this.iClickButton(confirmButton);

    return expect(
      this.page.getByRole("cell", { name: "Test Member1" })
    ).toBeHidden();
  }

  async iSwitchSeason() {
    const seasonTab = this.page.getByRole("tab", {
      name: `${defaultSeasons[1].name} ( person ${defaultSeasonTeams[1].Members.length})`,
    });
    await expect(seasonTab).not.toHaveAttribute("aria-selected", "true");
    await this.iClickButton(seasonTab);
    return expect(seasonTab).toHaveAttribute("aria-selected", "true");
  }

  async iSwitchTeam() {
    await expect(
      this.page
        .getByRole("heading", { name: `Team ${defaultTeams[0].name} pen` })
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
        .getByRole("heading", { name: `Team ${defaultTeams[1].name} pen` })
        .locator("b")
    ).toBeVisible();
  }

  async iEditTeam() {
    const editButton = this.page
      .getByRole("heading", { name: `Team ${defaultTeams[0].name} pen` })
      .getByRole("button");
    await this.iClickButton(editButton);

    const newTeamName = "Edited Team Name";

    const nameInput = this.page.getByRole("textbox");
    await this.iFillInput(nameInput, newTeamName);

    const saveButton = this.page.getByRole("button", { name: "check" });
    await this.iClickButton(saveButton);
  }

  async iDeleteTeam() {
    const openMenuButton = this.page.getByRole("button", {
      name: "three dots vertical",
    });
    await this.iClickButton(openMenuButton);

    const deleteButton = this.page.getByRole("menuitem", {
      name: "trash Delete team",
    });
    await this.iClickButton(deleteButton);

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await this.iClickButton(confirmButton);

    return expect(
      this.page
        .getByRole("heading", { name: `Team ${defaultTeams[1].name} pen` })
        .locator("b")
    ).toBeVisible();
  }

  async iDeleteSeason() {
    const openMenuButton = this.page.getByRole("button", {
      name: "three dots vertical",
    });
    await this.iClickButton(openMenuButton);

    const deleteButton = this.page.getByRole("menuitem", {
      name: "trash Delete season",
    });
    await this.iClickButton(deleteButton);

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await this.iClickButton(confirmButton);
    // check to ensure the season is deleted is not possible as the app simply reloads
  }
}
