import { Page } from "@playwright/test";
import {
  authAnyBackEndRequest,
  mockAuthMe,
  mockClubs,
  mockFeedback,
  mockNotifications,
  mockSeasons,
  mockVersion,
} from "./requests";

export async function mockDefaultStartRequests(page: Page) {
  await Promise.all([
    authAnyBackEndRequest(page),
    mockNotifications(page),
    mockAuthMe(page),
    mockClubs(page),
    mockSeasons(page),
    mockFeedback(page),
    mockVersion(page),
  ]);
}
