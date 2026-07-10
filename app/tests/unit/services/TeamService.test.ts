import { describe, test, expect, vi, beforeEach } from "vitest";
import ax from "@/services/RequestService";
import TeamService from "@/services/TeamService";

vi.mock("@/services/RequestService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/services/FeatureFlagService", () => ({
  default: {
    isEnabled: vi.fn().mockResolvedValue(true),
  },
}));

describe("TeamService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    test("should retrieve all teams", async () => {
      const mockResponse = { data: [{ id: "1", name: "Team A" }] };
      ax.get.mockResolvedValue(mockResponse);

      const result = await TeamService.getAll();

      expect(ax.get).toHaveBeenCalledWith("/team");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(TeamService.getAll()).rejects.toThrow("Network Error");

      expect(ax.get).toHaveBeenCalledWith("/team");
    });
  });

  describe("getByName", () => {
    test("should retrieve team by name", async () => {
      const mockResponse = { data: { id: "1", name: "Team A" } };
      ax.get.mockResolvedValue(mockResponse);

      const result = await TeamService.getByName("Team A");

      expect(ax.get).toHaveBeenCalledWith("/team", {
        params: { name: "Team A" },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if request fails", async () => {
      const mockError = new Error("Team not found");
      ax.get.mockRejectedValue(mockError);

      await expect(TeamService.getByName("Nonexistent Team")).rejects.toThrow(
        "Team not found"
      );

      expect(ax.get).toHaveBeenCalledWith("/team", {
        params: { name: "Nonexistent Team" },
      });
    });
  });

  describe("getById", () => {
    test("should retrieve team by ID", async () => {
      const mockResponse = { data: { id: "1", name: "Team A" } };
      ax.get.mockResolvedValue(mockResponse);

      const result = await TeamService.getById("1");

      expect(ax.get).toHaveBeenCalledWith("/team/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if request fails", async () => {
      const mockError = new Error("Team not found");
      ax.get.mockRejectedValue(mockError);

      await expect(TeamService.getById("999")).rejects.toThrow(
        "Team not found"
      );

      expect(ax.get).toHaveBeenCalledWith("/team/999");
    });
  });

  describe("create", () => {
    test("should create a new team", async () => {
      const mockResponse = { data: { id: "1", name: "New Team" } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await TeamService.create("New Team");

      expect(ax.post).toHaveBeenCalledWith("/team", {
        name: "New Team",
        clubId: undefined,
        seasonId: undefined,
        ownerId: null,
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if creation fails", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(TeamService.create("New Team")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledWith("/team", {
        name: "New Team",
        clubId: undefined,
        seasonId: undefined,
        ownerId: null,
      });
    });
  });

  describe("setName", () => {
    test("should update team name", async () => {
      const mockResponse = { data: { id: "1", name: "Updated Team" } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await TeamService.setName("1", "Updated Team");

      expect(ax.put).toHaveBeenCalledWith("/team/1", { name: "Updated Team" });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if update fails", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(TeamService.setName("1", "Updated Team")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.put).toHaveBeenCalledWith("/team/1", { name: "Updated Team" });
    });
  });

  describe("remove", () => {
    test("should delete a team", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await TeamService.remove("1");

      expect(ax.delete).toHaveBeenCalledWith("/team/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error if deletion fails", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(TeamService.remove("1")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledWith("/team/1");
    });
  });
});
