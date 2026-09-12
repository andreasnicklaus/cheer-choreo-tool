import { describe, test, expect, vi, beforeEach } from "vitest";
import LineupService from "@/services/LineupService";
import ax from "@/services/RequestService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("LineupService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    test("should call post endpoint to create a lineup", async () => {
      const mockResponse = { data: { id: "1", startCount: 1, endCount: 5 } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await LineupService.create(1, 5, "choreo1");

      expect(ax.post).toHaveBeenCalledWith("/lineup", {
        choreoId: "choreo1",
        endCount: 5,
        startCount: 1,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if create request fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(LineupService.create(1, 5, "choreo1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    test("should call put endpoint to update a lineup", async () => {
      const mockResponse = { data: { id: "1", startCount: 2, endCount: 6 } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await LineupService.update("1", {
        startCount: 2,
        endCount: 6,
      });

      expect(ax.put).toHaveBeenCalledWith("/lineup/1", {
        startCount: 2,
        endCount: 6,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if update request fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        LineupService.update("1", { startCount: 2, endCount: 6 })
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    test("should call delete endpoint to remove a lineup", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await LineupService.remove("1");

      expect(ax.delete).toHaveBeenCalledWith("/lineup/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if remove request fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(LineupService.remove("1")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("filterRejectedProposals", () => {
    test("should filter out rejected proposals", () => {
      const proposals = [
        [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        [
          { x: 3, y: 3 },
          { x: 4, y: 4 },
        ],
      ];
      const rejectedPositionProposals = [
        [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
      ];

      const result = LineupService.filterRejectedProposals(
        proposals,
        rejectedPositionProposals
      );

      expect(result).toEqual([
        [
          { x: 3, y: 3 },
          { x: 4, y: 4 },
        ],
      ]);
    });
  });

  describe("proposeLineup", () => {
    test("should propose lineup based on team members", () => {
      const teamMembers = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" },
      ];
      const rejectedPositionProposals = [
        [
          { x: 50, y: 40 },
          { x: 150, y: 40 },
          { x: 250, y: 40 },
        ],
      ];

      const result = LineupService.proposeLineup(
        teamMembers,
        rejectedPositionProposals
      );

      expect(result).toEqual([
        {
          Member: {
            id: "1",
            name: "Alice",
          },
          MemberId: "1",
          x: 35.714285714285715,
          y: 40,
        },
        {
          Member: {
            id: "2",
            name: "Bob",
          },
          MemberId: "2",
          x: 50,
          y: 40,
        },
        {
          Member: {
            id: "3",
            name: "Charlie",
          },
          MemberId: "3",
          x: 64.28571428571429,
          y: 40,
        },
      ]);
    });

    test("should return empty array if no team members", () => {
      const result = LineupService.proposeLineup([], []);
      expect(result).toEqual([]);
    });

    test("should return fixed lineup for 8-25 team members", () => {
      const teamMembers = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Member ${i + 1}`,
      }));
      const result = LineupService.proposeLineup(teamMembers, []);
      expect(result).toEqual([
        { MemberId: "1", Member: teamMembers[0], x: 28.571428571428573, y: 40 },
        { MemberId: "2", Member: teamMembers[1], x: 42.85714285714286, y: 40 },
        { MemberId: "3", Member: teamMembers[2], x: 57.142857142857146, y: 40 },
        { MemberId: "4", Member: teamMembers[3], x: 71.42857142857143, y: 40 },
        {
          MemberId: "5",
          Member: teamMembers[4],
          x: 35.714285714285715,
          y: 47.142857142857146,
        },
        { MemberId: "6", Member: teamMembers[5], x: 50, y: 47.142857142857146 },
        {
          MemberId: "7",
          Member: teamMembers[6],
          x: 64.28571428571429,
          y: 47.142857142857146,
        },
        {
          MemberId: "8",
          Member: teamMembers[7],
          x: 42.85714285714286,
          y: 54.285714285714285,
        },
        {
          MemberId: "9",
          Member: teamMembers[8],
          x: 57.142857142857146,
          y: 54.285714285714285,
        },
        {
          MemberId: "10",
          Member: teamMembers[9],
          x: 50,
          y: 61.42857142857143,
        },
      ]);
    });

    test("should return empty array if >25 team members", () => {
      const teamMembers = Array.from({ length: 26 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Member ${i + 1}`,
      }));
      const result = LineupService.proposeLineup(teamMembers, []);
      expect(result).toEqual([]);
    });
  });

  describe("getLinesForNumberOfMembers", () => {
    test("should return correct line distribution for given number of members", () => {
      expect(LineupService.getLinesForNumberOfMembers(8)).toEqual([3, 2, 3]);
      expect(LineupService.getLinesForNumberOfMembers(9)).toEqual([5, 4]);
      expect(LineupService.getLinesForNumberOfMembers(10)).toEqual([
        4, 3, 2, 1,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(11)).toEqual([6, 5]);
      expect(LineupService.getLinesForNumberOfMembers(12)).toEqual([5, 4, 3]);
      expect(LineupService.getLinesForNumberOfMembers(13)).toEqual([4, 5, 4]);
      expect(LineupService.getLinesForNumberOfMembers(14)).toEqual([
        5, 4, 3, 2,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(15)).toEqual([
        5, 4, 3, 2, 1,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(16)).toEqual([5, 6, 5]);
      expect(LineupService.getLinesForNumberOfMembers(17)).toEqual([6, 5, 6]);
      expect(LineupService.getLinesForNumberOfMembers(18)).toEqual([
        6, 5, 4, 3,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(19)).toEqual([
        4, 5, 4, 3, 2, 1,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(20)).toEqual([
        6, 5, 4, 3, 2,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(21)).toEqual([
        6, 5, 4, 3, 2, 1,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(22)).toEqual([
        7, 6, 5, 4,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(23)).toEqual([
        5, 4, 5, 4, 5,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(24)).toEqual([
        4, 5, 6, 5, 4,
      ]);
      expect(LineupService.getLinesForNumberOfMembers(25)).toEqual([
        7, 6, 5, 4, 3,
      ]);
    });
  });
});
