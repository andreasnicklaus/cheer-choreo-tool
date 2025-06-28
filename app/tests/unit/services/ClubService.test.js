import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";
import ClubService from "@/services/ClubService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("ClubService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    test("should call query endpoint", async () => {
      const mockResponse = { data: [{ id: "1", name: "Club A" }] };
      ax.get.mockResolvedValue(mockResponse);

      const result = await ClubService.getAll();

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/club");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(ClubService.getAll()).rejects.toThrow("Network Error");

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getById", () => {
    test("should call query endpoint with club ID", async () => {
      const mockResponse = { data: { id: "1", name: "Club A" } };
      ax.get.mockResolvedValue(mockResponse);

      const result = await ClubService.getById("1");

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/club/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(ClubService.getById("1")).rejects.toThrow("Network Error");

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("findByName", () => {
    test("should call query endpoint with club name", async () => {
      const mockResponse = { data: [{ id: "1", name: "Club A" }] };
      ax.get.mockResolvedValue(mockResponse);

      const result = await ClubService.findByName("Club A");

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/club", {
        params: { name: "Club A" },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(ClubService.findByName("Club A")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    test("should call create endpoint with club name", async () => {
      const mockResponse = { data: { id: "1", name: "Club A" } };
      ax.post.mockResolvedValue(mockResponse);

      const result = await ClubService.create("Club A");

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/club", { name: "Club A" });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.post.mockRejectedValue(mockError);

      await expect(ClubService.create("Club A")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    test("should call update endpoint with club ID and data", async () => {
      const mockResponse = { data: { id: "1", name: "Club A Updated" } };
      ax.put.mockResolvedValue(mockResponse);

      const result = await ClubService.update("1", { name: "Club A Updated" });

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/club/1", {
        name: "Club A Updated",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        ClubService.update("1", { name: "Club A Updated" })
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateClubLogo", () => {
    test("should call update endpoint with club ID and logo data", async () => {
      const mockFile = new File(["content"], "logo.png", {
        type: "image/jpeg",
      });
      const mockResponse = { data: { id: "1", logo: "logo.png" } };
      const mockFormData = new FormData();
      mockFormData.append("clubLogo", mockFile);
      ax.put.mockResolvedValue(mockResponse);

      const result = await ClubService.updateClubLogo("1", mockFile);

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/club/1/clubLogo", mockFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.put.mockRejectedValue(mockError);

      await expect(
        ClubService.updateClubLogo("1", { logo: "logo.png" })
      ).rejects.toThrow("Network Error");

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("getClubLogo", () => {
    test("should call get endpoint with club ID", async () => {
      const mockResponse = new Blob(["logo data"], { type: "image/png" });
      ax.get.mockResolvedValue(mockResponse);

      const result = await ClubService.getClubLogo("1");

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/club/1/clubLogo", {
        responseType: "blob",
      });
      expect(result).toEqual(mockResponse);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.get.mockRejectedValue(mockError);

      await expect(ClubService.getClubLogo("1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteClubLogo", () => {
    test("should call delete endpoint with club ID", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await ClubService.deleteClubLogo("1");

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith("/club/1/clubLogo");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(ClubService.deleteClubLogo("1")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    test("should call delete endpoint with club ID", async () => {
      const mockResponse = { data: { success: true } };
      ax.delete.mockResolvedValue(mockResponse);

      const result = await ClubService.remove("1");

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith("/club/1");
      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error on request failure", async () => {
      const mockError = new Error("Network Error");
      ax.delete.mockRejectedValue(mockError);

      await expect(ClubService.remove("1")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });
});
