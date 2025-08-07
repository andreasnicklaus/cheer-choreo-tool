import { Page } from "@playwright/test";
import { defaultUser } from "../testData/user";
import { defaultSeasons } from "../testData/season";
import { defaultVersion } from "../testData/version";
import { defaultNotifications } from "../testData/notification";
import { defaultClubs } from "../testData/club";
import { defaultTeams } from "../testData/team";

export async function authAnyBackEndRequest(page: Page) {
  await page.route("**/*", async (route) => {
    if (route.request().url().includes("https://api.choreo-planer.de/"))
      await route.fulfill({ status: 204 });
    else await route.continue();
  });
}

export async function mockAuthMe(page: Page, user = defaultUser) {
  return page.route("**/auth/me", async (route) => {
    await route.fulfill({
      json: user,
    });
  });
}

export async function mockNotifications(
  page: Page,
  notifications = defaultNotifications
) {
  return page.route("**/notifications", async (route) => {
    await route.fulfill({
      json: notifications,
    });
  });
}

export async function mockSeasons(page: Page, seasons = defaultSeasons) {
  return page.route("**/season", async (route) => {
    await route.fulfill({
      json: seasons,
    });
  });
}

export async function mockFeedback(page: Page, feedback = []) {
  return page.route("**/feedback", async (route) => {
    await route.fulfill({
      json: feedback,
    });
  });
}

export async function mockClubs(page: Page, clubs = defaultClubs) {
  return Promise.all([
    page.route("**/club", async (route) => {
      await route.fulfill({
        json: clubs,
      });
    }),
    clubs
      .map((club) =>
        page.route(`**/club/${club.id}`, async (route) => {
          await route.fulfill({
            json: club,
          });
        })
      )
      .flat(),
  ]);
}

export async function mockVersion(page: Page, version = defaultVersion) {
  return page.route("**/version", async (route) => {
    await route.fulfill({
      body: version,
    });
  });
}

export async function mockTeams(page: Page, teams = defaultTeams) {
  return Promise.all([
    page.route("**/team", async (route) => {
      await route.fulfill({
        json: teams,
      });
    }),
    teams
      .map((team) =>
        page.route(`**/team/${team.id}`, async (route) => {
          await route.fulfill({
            json: team,
          });
        })
      )
      .flat(),
  ]);
}
