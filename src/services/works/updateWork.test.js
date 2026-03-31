import { updateWork } from "./updateWork";

jest.mock("../utils/api", () => ({
  api: {
    put: jest.fn(),
  },
}));

jest.mock("../utils/utils", () => ({
  formatAuthorsForBackend: jest.fn(),
  formatLabelsForBackend: jest.fn(),
  formatLinksForBackend: jest.fn(),
  mapStatusToBackend: jest.fn(),
  mapWorkTypeToBackend: jest.fn(),
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    WORKS: {
      UPDATE: "/works/{id}",
    },
  },
}));

import { api } from "../utils/api";
import {
  formatAuthorsForBackend,
  formatLabelsForBackend,
  formatLinksForBackend,
  mapStatusToBackend,
  mapWorkTypeToBackend,
} from "../utils/utils";

describe("updateWork", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    formatAuthorsForBackend.mockReturnValue({ newAuthors: [], studentIds: [] });
    formatLabelsForBackend.mockReturnValue([]);
    formatLinksForBackend.mockReturnValue([]);
    mapStatusToBackend.mockImplementation((s) =>
      s === "draft" ? "DRAFT" : s ? s.toUpperCase() : "DRAFT"
    );
    mapWorkTypeToBackend.mockImplementation((t) => t);
  });

  const baseWorkData = {
    title: "Test Work",
    description: "A description",
    content: "Some content",
    workType: "ARTICLE",
    authors: [],
    labels: [],
    links: [],
  };

  describe("happy path", () => {
    test("calls api.put with the correct endpoint and returns response.data", async () => {
      const responseData = { id: 1, title: "Test Work" };
      api.put.mockResolvedValue({ data: responseData });

      const result = await updateWork(1, baseWorkData, "draft");

      expect(api.put).toHaveBeenCalledTimes(1);
      expect(api.put).toHaveBeenCalledWith("/works/1", expect.any(Object));
      expect(result).toEqual(responseData);
    });

    test("replaces {id} in endpoint with provided workId", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(42, baseWorkData);

      const calledUrl = api.put.mock.calls[0][0];
      expect(calledUrl).toBe("/works/42");
    });

    test("includes trimmed title in payload", async () => {
      api.put.mockResolvedValue({ data: {} });
      const workData = { ...baseWorkData, title: "  Trimmed Title  " };

      await updateWork(1, workData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.title).toBe("Trimmed Title");
    });

    test("includes mapped workStatus", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(1, baseWorkData, "draft");

      expect(mapStatusToBackend).toHaveBeenCalledWith("draft");
      const payload = api.put.mock.calls[0][1];
      expect(payload.workStatus).toBe("DRAFT");
    });

    test("includes mapped workType", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(1, baseWorkData, "draft");

      expect(mapWorkTypeToBackend).toHaveBeenCalledWith("ARTICLE");
    });

    test("uses default status 'draft' when not provided", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(1, baseWorkData);

      expect(mapStatusToBackend).toHaveBeenCalledWith("draft");
    });

    test("sets principalLink to first link URL when links are provided", async () => {
      api.put.mockResolvedValue({ data: {} });
      formatLinksForBackend.mockReturnValueOnce([
        { url: "https://first.com", name: "First", description: "" },
      ]);

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.principalLink).toBe("https://first.com");
    });

    test("sets principalLink to fallback when no links are provided", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.principalLink).toBe("https://exemplo.com");
    });

    test("includes newAuthors in payload when present", async () => {
      api.put.mockResolvedValue({ data: {} });
      formatAuthorsForBackend.mockReturnValueOnce({
        newAuthors: [{ name: "Alice", email: "alice@example.com" }],
        studentIds: [],
      });

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.newAuthors).toEqual([
        { name: "Alice", email: "alice@example.com" },
      ]);
    });

    test("includes studentIds in payload when provided in workData", async () => {
      api.put.mockResolvedValue({ data: {} });
      const workData = { ...baseWorkData, studentIds: [5, 10] };

      await updateWork(1, workData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.studentIds).toEqual([5, 10]);
    });

    test("includes workLabels in payload when labels are provided", async () => {
      api.put.mockResolvedValue({ data: {} });
      formatLabelsForBackend.mockReturnValueOnce([
        { name: "JavaScript", color: "#3B82F6" },
      ]);

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.workLabels).toEqual([
        { name: "JavaScript", color: "#3B82F6" },
      ]);
    });

    test("includes workLinks in payload when links are provided", async () => {
      api.put.mockResolvedValue({ data: {} });
      formatLinksForBackend.mockReturnValueOnce([
        { url: "https://example.com", name: "Example", description: "" },
      ]);

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.workLinks).toEqual([
        { url: "https://example.com", name: "Example", description: "" },
      ]);
    });

    test("omits newAuthors from payload when empty", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.newAuthors).toBeUndefined();
    });

    test("omits studentIds from payload when empty", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateWork(1, baseWorkData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.studentIds).toBeUndefined();
    });

    test("includes trimmed description in payload", async () => {
      api.put.mockResolvedValue({ data: {} });
      const workData = { ...baseWorkData, description: "  desc  " };

      await updateWork(1, workData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.description).toBe("desc");
    });

    test("includes imageUrl when provided", async () => {
      api.put.mockResolvedValue({ data: {} });
      const workData = {
        ...baseWorkData,
        imageUrl: "https://example.com/img.png",
      };

      await updateWork(1, workData, "draft");

      const payload = api.put.mock.calls[0][1];
      expect(payload.imageUrl).toBe("https://example.com/img.png");
    });
  });

  describe("error handling", () => {
    test("propagates errors from api.put", async () => {
      const error = new Error("Network error");
      api.put.mockRejectedValue(error);

      await expect(updateWork(1, baseWorkData, "draft")).rejects.toThrow(
        "Network error"
      );
    });

    test("propagates 500 server error", async () => {
      const serverError = new Error("Internal Server Error");
      serverError.response = { status: 500 };
      api.put.mockRejectedValue(serverError);

      await expect(updateWork(1, baseWorkData, "draft")).rejects.toThrow(
        "Internal Server Error"
      );
    });
  });
});
