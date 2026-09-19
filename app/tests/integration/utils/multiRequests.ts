import { Page } from "@playwright/test";
import {
  authAnyBackEndRequest,
  mockAuthMe,
  mockChoreos,
  mockClubs,
  mockFeedback,
  mockHits,
  mockLineups,
  mockMembers,
  mockNotifications,
  mockPositions,
  mockSeasons,
  mockTeams,
  mockVersion,
  mockUserAccess,
} from "./requests";
import { mockTrackingRequests } from "./trackingRequests";
import { mockFeatureFlagRequests } from "./featureFlagRequests";

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
    mockPositions(page),
    mockLineups(page),
    mockHits(page),
    mockUserAccess(page),
    mockTrackingRequests(page),
    mockFeatureFlagRequests(page),
  ]);
}
