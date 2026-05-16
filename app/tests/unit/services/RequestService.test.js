import { describe, test, expect, vi, beforeEach } from "vitest";
import ax from "@/services/RequestService";

vi.mock("axios", () => {
  const getMock = vi.fn();
  const postMock = vi.fn();
  const putMock = vi.fn();
  const patchMock = vi.fn();
  const deleteMock = vi.fn();

  return {
    default: {
      create: vi.fn(() => ({
        get: getMock,
        post: postMock,
        put: putMock,
        patch: patchMock,
        delete: deleteMock,
      })),
    },
  };
});

vi.mock("axios-cache-interceptor", () => {
  return {
    setupCache: vi.fn((instance) => {
      return {
        ...instance,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };
    }),
  };
});

describe("RequestService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
