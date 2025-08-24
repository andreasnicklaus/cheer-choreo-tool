import { Page } from "@playwright/test";
import { defaultUser } from "../testData/user";
import { defaultSeasons } from "../testData/season";
import { defaultVersion } from "../testData/version";
import { defaultNotifications } from "../testData/notification";
import { defaultClubs } from "../testData/club";
import { defaultTeams } from "../testData/team";
import { checkAuthorization } from "./authorization";
import { defaultChoreos } from "../testData/choreo";
import { defaultMembers } from "../testData/member";

const API_URL = "https://api.choreo-planer.de";

export async function authAnyBackEndRequest(page: Page) {
  await page.route("**/*", async (route) => {
    if (
      route.request().url().includes(API_URL) &&
      (await checkAuthorization(route.request()))
    )
      await route.fulfill({ status: 204 });
    else await route.continue();
  });
}

export async function mockAuthMe(page: Page, user = defaultUser) {
  return page.route(`${API_URL}/auth/me`, async (route) => {
    if (await checkAuthorization(route.request()))
      await route.fulfill({
        json: user,
      });
  });
}

export async function mockNotifications(
  page: Page,
  notifications = defaultNotifications
) {
  return page.route(`${API_URL}/notifications`, async (route) => {
    if (await checkAuthorization(route.request()))
      await route.fulfill({
        json: notifications,
      });
  });
}

export async function mockSeasons(page: Page, seasons = defaultSeasons) {
  return page.route(`${API_URL}/season`, async (route) => {
    if (await checkAuthorization(route.request()))
      await route.fulfill({
        json: seasons,
      });
  });
}

export async function mockFeedback(page: Page, feedback = []) {
  return page.route(`${API_URL}/feedback`, async (route) => {
    if (await checkAuthorization(route.request()))
      await route.fulfill({
        json: feedback,
      });
  });
}

export async function mockClubs(page: Page, clubs = defaultClubs) {
  return Promise.all([
    page.route(`${API_URL}/club`, async (route) => {
      if (await checkAuthorization(route.request()))
        await route.fulfill({
          json: clubs,
        });
    }),
    clubs
      .map((club) =>
        page.route(`${API_URL}/club/${club.id}`, async (route) => {
          if (await checkAuthorization(route.request()))
            await route.fulfill({
              json: club,
            });
        })
      )
      .flat(),
  ]);
}

export async function mockVersion(page: Page, version = defaultVersion) {
  return page.route(`${API_URL}/version`, async (route) => {
    await route.fulfill({
      body: version,
    });
  });
}

export async function mockTeams(page: Page, teams = defaultTeams) {
  return Promise.all([
    page.route(`${API_URL}/team`, async (route) => {
      if (await checkAuthorization(route.request()))
        await route.fulfill({
          json: teams,
        });
    }),
    teams
      .map((team) =>
        page.route(`${API_URL}/team/${team.id}`, async (route) => {
          if (await checkAuthorization(route.request()))
            await route.fulfill({
              json: team,
            });
        })
      )
      .flat(),
  ]);
}
export async function mockChoreos(page: Page, choreos = defaultChoreos) {
  return Promise.all([
    page.route(`${API_URL}/choreo`, async (route) => {
      if (await checkAuthorization(route.request()))
        await route.fulfill({
          json: choreos,
        });
    }),
    choreos
      .map((choreo) =>
        page.route(`${API_URL}/choreo/${choreo.id}`, async (route) => {
          if (await checkAuthorization(route.request()))
            await route.fulfill({
              json: choreo,
            });
        })
      )
      .flat(),
  ]);
}

export async function mockSsoLoginRequest(page: Page) {
  return page.route(`${API_URL}/auth/sso`, async (route) => {
    await route.fulfill({
      json: "sso-auth-token",
    });
  });
}

export async function mockLoginRequest(page: Page) {
  return page.route(`${API_URL}/auth/login`, async (route) => {
    const postData = JSON.parse(route.request().postData() as string);
    if (postData?.username && postData?.password) {
      if (postData.password == "falsePassword") {
        await route.fulfill({
          status: 401,
          json: "Invalid credentials",
        });
      } else
        await route.fulfill({
          json: "login-auth-token",
        });
    }
  });
}

export async function mockRegistrationRequest(page: Page) {
  return page.route(`${API_URL}/auth`, async (route) => {
    const postData = JSON.parse(route.request().postData() as string);
    if (postData?.username && postData?.email && postData?.password) {
      if (postData.password == "falsePassword") {
        await route.fulfill({
          status: 401,
          json: "Invalid credentials",
        });
      } else
        await route.fulfill({
          json: "registration-auth-token",
        });
    }
  });
}

export async function mockMembers(page: Page, members = defaultMembers) {
  return Promise.all([
    page.route(`${API_URL}/member`, async (route) => {
      if (await checkAuthorization(route.request()))
        if (route.request().method() === "POST") {
          const postData = JSON.parse(route.request().postData() as string);
          await route.fulfill({
            json: {
              ...postData,
              id: "new-member-id",
            },
          });
        } else
          await route.fulfill({
            json: members,
          });
    }),
    members
      .map((member) =>
        page.route(`${API_URL}/member/${member.id}`, async (route) => {
          if (await checkAuthorization(route.request()))
            await route.fulfill({
              json: member,
            });
        })
      )
      .flat(),
  ]);
}
