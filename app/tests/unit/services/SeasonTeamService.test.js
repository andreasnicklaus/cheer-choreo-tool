import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";
import SeasonTeamService from "@/services/SeasonTeamService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("SeasonTeamService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should call post endpoint to create a season team", async () => {
      const mockResponse = { data: { id: "1", name: "Team A" } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await SeasonTeamService.create(
        "test-teamId",
        "test-seasonId",
        ["test-memberId"]
      );

      expect(ax.post).toHaveBeenCalledWith("/seasonTeam", {
        teamId: "test-teamId",
        seasonId: "test-seasonId",
        MemberIds: ["test-memberId"],
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(
        SeasonTeamService.create("test-teamId", "test-seasonId", [
          "test-memberId",
        ])
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledWith("/seasonTeam", {
        teamId: "test-teamId",
        seasonId: "test-seasonId",
        MemberIds: ["test-memberId"],
      });
    });
  });

  describe("importMembers", () => {
    test("should call put endpoint to import members to a season team", async () => {
      const mockResponse = { data: { id: "1", name: "Team A" } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await SeasonTeamService.importMembers(
        "test-seasonTeamId",
        ["test-memberId1", "test-memberId2"]
      );

      expect(ax.put).toHaveBeenCalledWith("/seasonTeam/test-seasonTeamId", {
        MemberIds: ["test-memberId1", "test-memberId2"],
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if import request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        SeasonTeamService.importMembers("test-seasonTeamId", [
          "test-memberId1",
          "test-memberId2",
        ])
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledWith("/seasonTeam/test-seasonTeamId", {
        MemberIds: ["test-memberId1", "test-memberId2"],
      });
    });
  });

  describe("remove", () => {
    test("should call delete endpoint to remove a season team", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await SeasonTeamService.remove("test-seasonTeamId");

      expect(ax.delete).toHaveBeenCalledWith("/seasonTeam/test-seasonTeamId");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if remove request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(
        SeasonTeamService.remove("test-seasonTeamId")
      ).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledWith("/seasonTeam/test-seasonTeamId");
    });
  });
});
