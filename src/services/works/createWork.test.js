import { createWork } from "./createWork";

jest.mock("../utils/api", () => ({
  api: {
    post: jest.fn(),
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
      CREATE: "/works",
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

describe("createWork", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default implementations for format/map helpers
    formatAuthorsForBackend.mockImplementation((authors) => ({
      newAuthors: authors
        .filter((a) => !a.id)
        .map(({ name, email }) => ({ name, email })),
      studentIds: authors.filter((a) => a.id).map((a) => a.id),
    }));
    formatLabelsForBackend.mockImplementation((labels) =>
      labels.map((l) => ({
        name: typeof l === "string" ? l : l.name,
        color: "#3B82F6",
      }))
    );
    formatLinksForBackend.mockImplementation((links) =>
      links.map((l) => ({
        name: typeof l === "string" ? l : l.name || l,
        url:
          typeof l === "string"
            ? l.startsWith("http")
              ? l
              : `https://${l}`
            : l.url || `https://${l}`,
        description: "",
      }))
    );
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
    test("calls api.post with the correct endpoint and payload", async () => {
      api.post.mockResolvedValue({ data: { id: 1, title: "Test Work" } });

      await createWork(baseWorkData, "draft");

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith("/works", expect.any(Object));
    });

    test("returns response.data on success", async () => {
      const responseData = { id: 42, title: "Test Work" };
      api.post.mockResolvedValue({ data: responseData });

      const result = await createWork(baseWorkData, "draft");

      expect(result).toEqual(responseData);
    });

    test("includes trimmed title in payload", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = { ...baseWorkData, title: "  Trimmed Title  " };

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.title).toBe("Trimmed Title");
    });

    test("includes mapped workStatus from mapStatusToBackend", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      expect(mapStatusToBackend).toHaveBeenCalledWith("draft");
      const payload = api.post.mock.calls[0][1];
      expect(payload.workStatus).toBe("DRAFT");
    });

    test("includes mapped workType from mapWorkTypeToBackend", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      expect(mapWorkTypeToBackend).toHaveBeenCalledWith("ARTICLE");
    });

    test("sets principalLink to first link URL when links are provided", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = {
        ...baseWorkData,
        links: [{ url: "https://first.com", name: "First" }],
      };

      formatLinksForBackend.mockReturnValueOnce([
        { url: "https://first.com", name: "First", description: "" },
      ]);

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.principalLink).toBe("https://first.com");
    });

    test("sets principalLink to fallback when no links are provided", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.principalLink).toBe("https://exemplo.com");
    });

    test("includes newAuthors in payload when present", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = {
        ...baseWorkData,
        authors: [{ name: "Alice", email: "alice@example.com" }],
      };

      formatAuthorsForBackend.mockReturnValueOnce({
        newAuthors: [{ name: "Alice", email: "alice@example.com" }],
        studentIds: [],
      });

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.newAuthors).toEqual([
        { name: "Alice", email: "alice@example.com" },
      ]);
    });

    test("includes studentIds in payload when present", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = {
        ...baseWorkData,
        authors: [{ id: 5, name: "Bob", email: "bob@example.com" }],
        studentIds: [5],
      };

      formatAuthorsForBackend.mockReturnValueOnce({
        newAuthors: [],
        studentIds: [],
      });

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      // studentIds come from workData.studentIds, not from formatAuthorsForBackend
      expect(payload.studentIds).toEqual([5]);
    });

    test("includes workLabels in payload when labels are provided", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = { ...baseWorkData, labels: ["JavaScript"] };

      formatLabelsForBackend.mockReturnValueOnce([
        { name: "JavaScript", color: "#3B82F6" },
      ]);

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.workLabels).toEqual([
        { name: "JavaScript", color: "#3B82F6" },
      ]);
    });

    test("omits newAuthors from payload when empty", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.newAuthors).toBeUndefined();
    });

    test("uses default status 'draft' when not provided", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData);

      expect(mapStatusToBackend).toHaveBeenCalledWith("draft");
    });

    test("calls formatAuthorsForBackend with authors array", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      expect(formatAuthorsForBackend).toHaveBeenCalledWith([]);
    });

    test("calls formatLabelsForBackend with labels array", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      expect(formatLabelsForBackend).toHaveBeenCalledWith([]);
    });

    test("calls formatLinksForBackend with links array", async () => {
      api.post.mockResolvedValue({ data: {} });

      await createWork(baseWorkData, "draft");

      expect(formatLinksForBackend).toHaveBeenCalledWith([]);
    });

    test("includes description trimmed in payload", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = { ...baseWorkData, description: "  some desc  " };

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.description).toBe("some desc");
    });

    test("includes imageUrl in payload when provided", async () => {
      api.post.mockResolvedValue({ data: {} });
      const workData = {
        ...baseWorkData,
        imageUrl: "https://example.com/img.png",
      };

      await createWork(workData, "draft");

      const payload = api.post.mock.calls[0][1];
      expect(payload.imageUrl).toBe("https://example.com/img.png");
    });
  });

  describe("error handling", () => {
    test("re-throws 401 error directly", async () => {
      const authError = new Error("Unauthorized");
      authError.response = { status: 401 };
      api.post.mockRejectedValue(authError);

      await expect(createWork(baseWorkData, "draft")).rejects.toBe(authError);
    });

    test("throws generic Error for non-401 API errors with error message", async () => {
      const serverError = new Error("Server Error");
      serverError.response = { status: 500, data: { error: "Internal error" } };
      api.post.mockRejectedValue(serverError);

      await expect(createWork(baseWorkData, "draft")).rejects.toThrow(
        "Internal error"
      );
    });

    test("throws fallback message when error response has no data.error", async () => {
      const networkError = new Error("Network failure");
      networkError.response = { status: 500, data: {} };
      api.post.mockRejectedValue(networkError);

      await expect(createWork(baseWorkData, "draft")).rejects.toThrow(
        "An error occurred while creating the work"
      );
    });

    test("throws fallback message when error has no response", async () => {
      api.post.mockRejectedValue(new Error("No response"));

      await expect(createWork(baseWorkData, "draft")).rejects.toThrow(
        "An error occurred while creating the work"
      );
    });
  });
});
