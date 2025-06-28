import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ChoreoService from "@/services/ChoreoService";
import ax from "@/services/RequestService";

jest.mock("@/services/RequestService", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("ChoreoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getByTeam", () => {
    test("should call the query endpoint with the correct parameters", async () => {
      ax.get.mockResolvedValue({ data: [{ key: "value" }] });

      const result = await ChoreoService.getByTeam("test-teamId");

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/choreo", {
        params: { teamId: "test-teamId" },
      });

      expect(result).toEqual([{ key: "value" }]);
    });

    test("should throw error on query request failure", () => {
      ax.get.mockRejectedValue(new Error("Network Error"));

      expect(ChoreoService.getByTeam("teamId", "query")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getById", () => {
    test("should call the query endpoint with the correct parameters", async () => {
      ax.get.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.getById("test-choreoId");

      expect(ax.get).toHaveBeenCalledTimes(1);
      expect(ax.get).toHaveBeenCalledWith("/choreo/test-choreoId");
      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on query request failure", () => {
      ax.get.mockRejectedValue(new Error("Network Error"));

      expect(ChoreoService.getById("choreoId")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("changeName", () => {
    test("should call the put endpoint with the correct parameters", async () => {
      ax.put.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.changeName("test-choreoId", "newName");

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/choreo/test-choreoId", {
        name: "newName",
      });

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on change name request failure", () => {
      ax.put.mockRejectedValue(new Error("Network Error"));

      expect(ChoreoService.changeName("choreoId", "newName")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("changeLength", () => {
    test("should call the put endpoint with the correct parameters", async () => {
      ax.put.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.changeLength("test-choreoId", 120);

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/choreo/test-choreoId", {
        counts: 120,
      });

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on change length request failure", () => {
      ax.put.mockRejectedValue(new Error("Network Error"));

      expect(ChoreoService.changeLength("choreoId", 120)).rejects.toThrow(
        "Network Error"
      );

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("changeMatType", () => {
    test("should call the put endpoint with the correct parameters", async () => {
      ax.put.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.changeMatType(
        "test-choreoId",
        "spring"
      );

      expect(ax.put).toHaveBeenCalledTimes(1);
      expect(ax.put).toHaveBeenCalledWith("/choreo/test-choreoId", {
        matType: "spring",
      });

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on change mat type request failure", () => {
      ax.put.mockRejectedValue(new Error("Network Error"));

      expect(ChoreoService.changeMatType("choreoId", "spring")).rejects.toThrow(
        "Network Error"
      );

      expect(ax.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    test("should call the post endpoint with the correct parameters", async () => {
      ax.post.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.create(
        "test-name",
        5,
        "test-matType",
        "test-seasonTeamId",
        ["test-participantId"]
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith("/choreo", {
        name: "test-name",
        counts: 5,
        matType: "test-matType",
        seasonTeamId: "test-seasonTeamId",
        participants: ["test-participantId"],
      });

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on create request failure", () => {
      ax.post.mockRejectedValue(new Error("Network Error"));

      expect(
        ChoreoService.create({ teamId: "teamId", name: "New Choreo" })
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    test("should call the delete endpoint with the correct parameters", async () => {
      ax.delete.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.remove("test-choreoId");

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith("/choreo/test-choreoId");

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on remove request failure", () => {
      ax.delete.mockRejectedValue(new Error("Network Error"));

      expect(ChoreoService.remove("choreoId")).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("addParticipant", () => {
    test("should call the post endpoint with the correct parameters", async () => {
      ax.post.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.addParticipant(
        "test-choreoId",
        "test-participantId",
        "test-color"
      );

      expect(ax.post).toHaveBeenCalledTimes(1);
      expect(ax.post).toHaveBeenCalledWith(
        "/choreo/test-choreoId/participants",
        {
          memberId: "test-participantId",
          color: "test-color",
        }
      );

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on add participant request failure", () => {
      ax.post.mockRejectedValue(new Error("Network Error"));

      expect(
        ChoreoService.addParticipant("choreoId", "participantId")
      ).rejects.toThrow("Network Error");

      expect(ax.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeParticipant", () => {
    test("should call the delete endpoint with the correct parameters", async () => {
      ax.delete.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.removeParticipant(
        "test-choreoId",
        "test-participantId"
      );

      expect(ax.delete).toHaveBeenCalledTimes(1);
      expect(ax.delete).toHaveBeenCalledWith(
        "/choreo/test-choreoId/participants/test-participantId"
      );

      expect(result).toEqual({ data: { key: "value" } });
    });

    test("should throw error on remove participant request failure", () => {
      ax.delete.mockRejectedValue(new Error("Network Error"));

      expect(
        ChoreoService.removeParticipant("choreoId", "participantId")
      ).rejects.toThrow("Network Error");

      expect(ax.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("replaceParticipant", () => {
    test("should call the put endpoint with the correct parameters", async () => {
      ax.patch.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.replaceParticipant(
        "test-choreoId",
        "test-oldParticipantId",
        "test-newParticipantId"
      );

      expect(ax.patch).toHaveBeenCalledTimes(1);
      expect(ax.patch).toHaveBeenCalledWith(
        "/choreo/test-choreoId/participants",
        {
          memberToAddId: "test-newParticipantId",
          memberToRemoveId: "test-oldParticipantId",
        }
      );

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on replace participant request failure", () => {
      ax.patch.mockRejectedValue(new Error("Network Error"));

      expect(
        ChoreoService.replaceParticipant(
          "choreoId",
          "oldParticipantId",
          "newParticipantId"
        )
      ).rejects.toThrow("Network Error");

      expect(ax.patch).toHaveBeenCalledTimes(1);
    });
  });
  describe("changeParticipantColor", () => {
    test("should call the put endpoint with the correct parameters", async () => {
      ax.patch.mockResolvedValue({ data: { key: "value" } });

      const result = await ChoreoService.changeParticipantColor(
        "test-choreoId",
        "test-participantId",
        "test-color"
      );

      expect(ax.patch).toHaveBeenCalledTimes(1);
      expect(ax.patch).toHaveBeenCalledWith(
        "/choreo/test-choreoId/participants/test-participantId",
        { color: "test-color" }
      );

      expect(result).toEqual({ key: "value" });
    });

    test("should throw error on change participant color request failure", () => {
      ax.patch.mockRejectedValue(new Error("Network Error"));

      expect(
        ChoreoService.changeParticipantColor(
          "choreoId",
          "participantId",
          "color"
        )
      ).rejects.toThrow("Network Error");

      expect(ax.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("miscellaneous", () => {
    test("matTypeOptions should return correct options", () => {
      const options = ChoreoService.matTypeOptions();
      expect(options).toEqual([
        {
          label: "By Sport (Lines on the mat)",
          options: [
            {
              text: "Cheer (1:1, 7 lanes)",
              value: "cheer",
            },
          ],
        },
        {
          label: "By stage form (no lines)",
          options: [
            {
              text: "Square (1:1)",
              value: "square",
            },
            {
              text: "Flat Rectangle (1:2)",
              value: "1:2",
            },
            {
              text: "Boxy Rectangle (3:4)",
              value: "3:4",
            },
          ],
        },
      ]);
    });
  });
  describe("getPositionsFromChoreoAndCount", () => {
    test("should return default positions for empty counts", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        { Lineups: [] },
        0,
        [{ id: "1" }]
      );
      expect(result).toEqual([
        {
          Member: { id: "1" },
          MemberId: "1",
          x: 7.142857142857143,
          y: 10,
        },
      ]);
    });
    test("should return correct positions for current count", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        {
          Lineups: [
            {
              id: "1",
              startCount: 0,
              endCount: 5,
              Positions: [{ memberId: "1", x: 0, y: 0 }],
            },
            {
              id: "2",
              startCount: 5,
              endCount: 10,
              Positions: [{ memberId: "1", x: 5, y: 5 }],
            },
          ],
        },
        0,
        []
      );
      expect(result).toEqual([
        { Member: undefined, memberId: "1", x: 0, y: 0 },
      ]);
    });

    test("should return positions with member object", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        {
          Lineups: [
            {
              id: "1",
              startCount: 0,
              endCount: 5,
              Positions: [{ MemberId: "1", x: 0, y: 0 }],
            },
            {
              id: "2",
              startCount: 5,
              endCount: 10,
              Positions: [{ MemberId: "1", x: 5, y: 5 }],
            },
          ],
        },
        0,
        [
          { id: "1", name: "test-name", key: "value" },
          { id: "2", name: "test-name", key: "value" },
        ]
      );
      expect(result[0].Member).toEqual({
        id: "1",
        name: "test-name",
        key: "value",
      });
    });

    test("should return interpolated position for current count", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        {
          Lineups: [
            {
              id: "1",
              startCount: 0,
              endCount: 0,
              Positions: [{ MemberId: "1", x: 0, y: 0 }],
            },
            {
              id: "2",
              startCount: 2,
              endCount: 2,
              Positions: [{ MemberId: "1", x: 10, y: 10 }],
            },
          ],
        },
        1,
        [{ id: "1", name: "test-name", key: "value" }]
      );

      expect(result).toEqual([
        {
          Member: { id: "1", name: "test-name", key: "value" },
          MemberId: "1",
          x: 5,
          y: 5,
        },
      ]);
    });
    test("should return previous position for last count", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        {
          Lineups: [
            {
              id: "1",
              startCount: 0,
              endCount: 0,
              Positions: [{ MemberId: "1", x: 1, y: 2 }],
            },
          ],
        },
        1,
        [{ id: "1", name: "test-name", key: "value" }]
      );

      expect(result).toEqual([
        {
          Member: { id: "1", name: "test-name", key: "value" },
          MemberId: "1",
          x: 1,
          y: 2,
        },
      ]);
    });

    test("should return next position for early count", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        {
          Lineups: [
            {
              id: "1",
              startCount: 10,
              endCount: 10,
              Positions: [{ MemberId: "1", x: 1, y: 2 }],
            },
          ],
        },
        0,
        [{ id: "1", name: "test-name", key: "value" }]
      );

      expect(result).toEqual([
        {
          Member: { id: "1", name: "test-name", key: "value" },
          MemberId: "1",
          x: 1,
          y: 2,
        },
      ]);
    });

    test("should return empty position for faulty input", () => {
      const result = ChoreoService.getPositionsFromChoreoAndCount(
        null,
        null,
        null
      );

      expect(result).toEqual([]);
    });
  });
});
