import { test, expect, jest, beforeEach } from "@jest/globals";
import { describe } from "node:test";
import ax from "@/services/RequestService";

jest.mock("axios", () => {
  const getMock = jest.fn();
  const postMock = jest.fn();
  const putMock = jest.fn();
  const patchMock = jest.fn();
  const deleteMock = jest.fn();

  return {
    create: jest.fn(() => ({
      get: getMock,
      post: postMock,
      put: putMock,
      patch: patchMock,
      delete: deleteMock,
    })),
  };
});

jest.mock("axios-cache-interceptor", () => {
  return {
    setupCache: jest.fn((instance) => {
      return {
        ...instance,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };
    }),
  };
});

describe("RequestService", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should mock axios methods", () => {
    expect(ax.get).toBeDefined();
    ax.get("/test-get-endpoint");
    expect(ax.get).toHaveBeenCalledTimes(1);
    expect(ax.get).toHaveBeenCalledWith("/test-get-endpoint");

    expect(ax.post).toBeDefined();
    ax.post("/test-post-endpoint");
    expect(ax.post).toHaveBeenCalledTimes(1);
    expect(ax.post).toHaveBeenCalledWith("/test-post-endpoint");

    expect(ax.put).toBeDefined();
    ax.put("/test-put-endpoint");
    expect(ax.put).toHaveBeenCalledTimes(1);
    expect(ax.put).toHaveBeenCalledWith("/test-put-endpoint");

    expect(ax.patch).toBeDefined();
    ax.patch("/test-patch-endpoint");
    expect(ax.patch).toHaveBeenCalledTimes(1);
    expect(ax.patch).toHaveBeenCalledWith("/test-patch-endpoint");

    expect(ax.delete).toBeDefined();
    ax.delete("/test-delete-endpoint");
    expect(ax.delete).toHaveBeenCalledTimes(1);
    expect(ax.delete).toHaveBeenCalledWith("/test-delete-endpoint");
  });
});
