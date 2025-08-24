import { Page } from "@playwright/test";
import {
  authAnyBackEndRequest,
  mockAuthMe,
  mockChoreos,
  mockClubs,
  mockFeedback,
  mockMembers,
  mockNotifications,
  mockSeasons,
  mockTeams,
  mockVersion,
} from "./requests";
import { mockTrackingRequests } from "./trackingRequests";

export async function mockDefaultStartRequests(page: Page) {
  await Promise.all([
    authAnyBackEndRequest(page),
    mockNotifications(page),
    mockAuthMe(page),
    mockClubs(page),
    mockSeasons(page),
    mockFeedback(page),
    mockVersion(page),
    mockChoreos(page),
    mockTeams(page),
    mockMembers(page),
    mockTrackingRequests(page),
  ]);
}
